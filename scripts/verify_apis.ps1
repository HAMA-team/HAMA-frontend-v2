Param(
  [string]$BaseUrl = "http://localhost:8000",
  [string]$OutPath = "docs/backend/API_Test_Report.md",
  [string]$OriginForPreflight = "http://localhost:3000"
)

function New-Result {
  Param(
    [string]$Name,
    [string]$Method,
    [string]$Path,
    [int]$StatusCode,
    [bool]$Ok,
    [string]$Notes,
    [string]$Snippet,
    [hashtable]$Headers
  )
  [PSCustomObject]@{
    name=$Name; method=$Method; path=$Path; status=$StatusCode; ok=$Ok; notes=$Notes; snippet=$Snippet; headers=$Headers
  }
}

function Format-Snippet {
  Param([Parameter(Mandatory=$true)]$Body, [int]$MaxLen=2000)
  try {
    if ($null -eq $Body) { return "" }
    if ($Body -is [string]) {
      $s = $Body
    } else {
      $s = ($Body | ConvertTo-Json -Depth 8)
    }
    # Heuristic fix for mojibake (UTF-8 shown as Latin-1)
    if ($s -match "[Ãðìí]") {
      try {
        $latin1 = [System.Text.Encoding]::GetEncoding(28591)
        $bytes  = $latin1.GetBytes($s)
        $fixed  = [System.Text.Encoding]::UTF8.GetString($bytes)
        if ($fixed -and ($fixed -ne $s)) { $s = $fixed }
      } catch {}
    }
    if ($s.Length -gt $MaxLen) { return $s.Substring(0, $MaxLen) + "`n... (truncated)" }
    return $s
  } catch {
    return ("" + $Body)
  }
}

function Invoke-Json {
  Param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Body,
    [hashtable]$Headers
  )
  try {
    $json = $null
    if ($Body) { $json = ($Body | ConvertTo-Json -Depth 8) }
    if ($Method -eq 'GET' -and -not $Body) {
      $resp = Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -ErrorAction Stop
    } else {
      $resp = Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -ContentType "application/json" -Body $json -ErrorAction Stop
    }
    return @{ ok=$true; status=200; body=$resp; headers=@{} }
  } catch {
    $ex = $_.Exception
    $status = $ex.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($ex.Response.GetResponseStream())
    $text = $reader.ReadToEnd()
    return @{ ok=$false; status=$status; body=$text; headers=@{} }
  }
}

function Invoke-SseProbe {
  Param(
    [string]$Url,
    [hashtable]$Body
  )
  try {
    $json = ($Body | ConvertTo-Json -Depth 8)
    $resp = Invoke-WebRequest -Method Post -Uri $Url -ContentType "application/json" -Headers @{ Accept = "text/event-stream" } -Body $json -MaximumRedirection 0 -TimeoutSec 15 -ErrorAction Stop
    $ct = $resp.Headers["Content-Type"]
    return @{ ok=($resp.StatusCode -eq 200 -and $ct -like "text/event-stream*"); status=[int]$resp.StatusCode; body=($resp.Content.Substring(0, [Math]::Min(500, $resp.Content.Length))); headers=$resp.Headers }
  } catch {
    $ex = $_.Exception
    $status = 0
    $body = $ex.Message
    if ($ex.Response) {
      $status = $ex.Response.StatusCode.value__
      $reader = New-Object System.IO.StreamReader($ex.Response.GetResponseStream())
      $body = $reader.ReadToEnd()
    }
    return @{ ok=$false; status=$status; body=$body; headers=@{} }
  }
}

$base = $BaseUrl.TrimEnd('/')
$results = @()
$isNgrok = ($base -match 'ngrok')

function Default-Headers {
  Param([string]$accept)
  $h = @{}
  if ($accept) { $h['Accept'] = $accept }
  $h['Content-Type'] = 'application/json'
  if ($isNgrok) { $h['ngrok-skip-browser-warning'] = 'true' }
  return $h
}

Write-Host "Testing against $base" -ForegroundColor Cyan

# 1) Chat - POST /api/v1/chat/
$u = "$base/api/v1/chat/"
$r = Invoke-Json -Method Post -Url $u -Body @{ message = "ping"; conversation_id = $null; automation_level = 2 } -Headers (Default-Headers 'application/json')
$cid = $null
try { $cid = $r.body.conversation_id } catch {}
$results += (New-Result -Name "Chat" -Method "POST" -Path "/api/v1/chat/" -StatusCode $r.status -Ok $r.ok -Notes "returns conversation_id? $($cid)" -Snippet (Format-Snippet $r.body) -Headers $r.headers)

# 2) Chat SSE - POST /api/v1/chat/multi-stream (probe only)
$u = "$base/api/v1/chat/multi-stream"
$s = Invoke-SseProbe -Url $u -Body @{ message = "stream ping"; conversation_id = $cid; automation_level = 2 }
$results += (New-Result -Name "Chat Multi-Stream (SSE)" -Method "POST" -Path "/api/v1/chat/multi-stream" -StatusCode $s.status -Ok $s.ok -Notes "Content-Type should be text/event-stream" -Snippet (Format-Snippet $s.body) -Headers $s.headers)

# 3) Chat Sessions - GET
$u = "$base/api/v1/chat/sessions"
$r = Invoke-Json -Method Get -Url $u -Body $null -Headers (Default-Headers 'application/json')
$results += (New-Result -Name "List Chat Sessions" -Method "GET" -Path "/api/v1/chat/sessions" -StatusCode $r.status -Ok $r.ok -Notes "expect array" -Snippet (Format-Snippet $r.body) -Headers $r.headers)

# 4) Chat History (optional)
if ($cid) {
  $u = "$base/api/v1/chat/history/$cid"
  $r = Invoke-Json -Method Get -Url $u -Body $null -Headers (Default-Headers 'application/json')
  $results += (New-Result -Name "Get Chat History" -Method "GET" -Path "/api/v1/chat/history/{conversation_id}" -StatusCode $r.status -Ok $r.ok -Notes "conversation_id=$cid" -Snippet (Format-Snippet $r.body) -Headers $r.headers)
}

# 5) Portfolio overview
foreach ($path in @(
  "/api/v1/dashboard/",
  "/api/v1/portfolio/",
  "/api/v1/portfolio/chart-data",
  "/api/v1/settings/automation-level",
  "/api/v1/settings/automation-levels"
)) {
  $u = "$base$path"
  $r = Invoke-Json -Method Get -Url $u -Body $null -Headers (Default-Headers 'application/json')
  $results += (New-Result -Name $path -Method "GET" -Path $path -StatusCode $r.status -Ok $r.ok -Notes "" -Snippet (Format-Snippet $r.body) -Headers $r.headers)
}

# 6) Stocks search (q required)
$u = "$base/api/v1/stocks/search?q=삼성"
$r = Invoke-Json -Method Get -Url $u -Body $null -Headers (Default-Headers 'application/json')
$results += (New-Result -Name "Search Stocks" -Method "GET" -Path "/api/v1/stocks/search?q=삼성" -StatusCode $r.status -Ok $r.ok -Notes "q=삼성" -Snippet (Format-Snippet $r.body) -Headers $r.headers)

# Derive IDs for dependent tests
$portfolioId = $null
try {
  $po = Invoke-Json -Method Get -Url ($base + '/api/v1/portfolio/') -Body $null -Headers (Default-Headers 'application/json')
  # Try typical fields
  $portfolioId = $po.body.portfolio_id
  if (-not $portfolioId -and $po.body.id) { $portfolioId = $po.body.id }
} catch {}

$firstStock = $null
try {
  if ($r.ok) {
    $arr = @($r.body)
    if ($arr.Count -eq 0 -and $r.body.items) { $arr = $r.body.items }
    $first = $arr[0]
    $firstStock = $first.stock_code; if (-not $firstStock) { $firstStock = $first.code }
  }
} catch {}

# 8) Chat history delete (if cid)
if ($cid) {
  $u = "$base/api/v1/chat/history/$cid"
  try { $d = Invoke-WebRequest -Method Delete -Uri $u -Headers (Default-Headers 'application/json') -ErrorAction Stop; $st=[int]$d.StatusCode; $ok=($st -in 200,204) } catch { $st=$_.Exception.Response.StatusCode.value__; $ok=$false }
  $results += (New-Result -Name "Delete Chat History" -Method "DELETE" -Path "/api/v1/chat/history/{conversation_id}" -StatusCode $st -Ok $ok -Notes "conversation_id=$cid" -Snippet "" -Headers @{})
}

# 9) Approve action (best-effort)
try {
  $u = "$base/api/v1/chat/approve"
  $body = @{ thread_id = (if ($cid) { $cid } else { 'dummy' }); decision = 'approved'; automation_level = 2 }
  $ap = Invoke-Json -Method Post -Url $u -Body $body -Headers (Default-Headers 'application/json')
  $results += (New-Result -Name "Approve Action" -Method "POST" -Path "/api/v1/chat/approve" -StatusCode $ap.status -Ok $ap.ok -Notes "thread_id=$($body.thread_id)" -Snippet (Format-Snippet $ap.body) -Headers @{})
} catch {}

# 10) Portfolio by id / performance / rebalance (best-effort)
if ($portfolioId) {
  foreach ($p in @("/api/v1/portfolio/$portfolioId", "/api/v1/portfolio/$portfolioId/performance")) {
    $r = Invoke-Json -Method Get -Url ($base + $p) -Body $null -Headers (Default-Headers 'application/json')
    $results += (New-Result -Name $p -Method "GET" -Path $p -StatusCode $r.status -Ok $r.ok -Notes "portfolio_id=$portfolioId" -Snippet (Format-Snippet $r.body) -Headers @{})
  }
  # rebalance (may 4xx)
  $rb = Invoke-Json -Method Post -Url ($base + "/api/v1/portfolio/$portfolioId/rebalance") -Body @{ target_weights = @{} } -Headers (Default-Headers 'application/json')
  $results += (New-Result -Name "Rebalance" -Method "POST" -Path "/api/v1/portfolio/{portfolio_id}/rebalance" -StatusCode $rb.status -Ok $rb.ok -Notes "portfolio_id=$portfolioId" -Snippet (Format-Snippet $rb.body) -Headers @{})
} else {
  $results += (New-Result -Name "Portfolio detail" -Method "GET" -Path "/api/v1/portfolio/{portfolio_id}" -StatusCode 0 -Ok $false -Notes "no portfolio_id discovered" -Snippet "" -Headers @{})
}

# 11) Stocks detail endpoints (if stock code available)
if ($firstStock) {
  foreach ($p in @("/api/v1/stocks/$firstStock", "/api/v1/stocks/$firstStock/price-history", "/api/v1/stocks/$firstStock/analysis")) {
    $r = Invoke-Json -Method Get -Url ($base + $p) -Body $null -Headers (Default-Headers 'application/json')
    $results += (New-Result -Name $p -Method "GET" -Path $p -StatusCode $r.status -Ok $r.ok -Notes "stock_code=$firstStock" -Snippet (Format-Snippet $r.body) -Headers @{})
  }
} else {
  $results += (New-Result -Name "Stocks detail" -Method "GET" -Path "/api/v1/stocks/{stock_code}*" -StatusCode 0 -Ok $false -Notes "no stock_code discovered" -Snippet "" -Headers @{})
}

# 12) Settings PUT automation-level (idempotent attempt)
try {
  $cur = Invoke-Json -Method Get -Url ($base + "/api/v1/settings/automation-level") -Body $null -Headers (Default-Headers 'application/json')
  $level = $cur.body.level; if (-not $level) { $level = 2 }
  $put = Invoke-Json -Method Put -Url ($base + "/api/v1/settings/automation-level") -Body @{ level=$level; confirm=$true } -Headers (Default-Headers 'application/json')
  $results += (New-Result -Name "Update Automation Level" -Method "PUT" -Path "/api/v1/settings/automation-level" -StatusCode $put.status -Ok $put.ok -Notes "level=$level" -Snippet (Format-Snippet $put.body) -Headers @{})
} catch {}

# 13) Artifacts create + get detail (best-effort)
try {
  $create = Invoke-Json -Method Post -Url ($base + "/api/v1/artifacts/") -Body @{ title = "테스트 아티팩트"; content = "# 테스트\n내용"; artifact_type = "analysis"; metadata = @{ source = "smoke" } } -Headers (Default-Headers 'application/json')
  $aid = $create.body.artifact_id; if (-not $aid) { $aid = $create.body.id }
  $results += (New-Result -Name "Create Artifact" -Method "POST" -Path "/api/v1/artifacts/" -StatusCode $create.status -Ok $create.ok -Notes "artifact_id=$aid" -Snippet (Format-Snippet $create.body) -Headers @{})
  if ($aid) {
    $det = Invoke-Json -Method Get -Url ($base + "/api/v1/artifacts/$aid") -Body $null -Headers (Default-Headers 'application/json')
    $results += (New-Result -Name "Get Artifact" -Method "GET" -Path "/api/v1/artifacts/{artifact_id}" -StatusCode $det.status -Ok $det.ok -Notes "artifact_id=$aid" -Snippet (Format-Snippet $det.body) -Headers @{})
  }
} catch {}

# 14) Approvals list + detail (best-effort)
try {
  $lst = Invoke-Json -Method Get -Url ($base + "/api/v1/approvals/") -Body $null -Headers (Default-Headers 'application/json')
  $rid = $null
  try { $rid = $lst.body.items[0].request_id } catch {}
  $results += (New-Result -Name "List Approvals" -Method "GET" -Path "/api/v1/approvals/" -StatusCode $lst.status -Ok $lst.ok -Notes "items? $($lst.body.items.Count)" -Snippet (Format-Snippet $lst.body) -Headers @{})
  if ($rid) {
    $det = Invoke-Json -Method Get -Url ($base + "/api/v1/approvals/$rid") -Body $null -Headers (Default-Headers 'application/json')
    $results += (New-Result -Name "Get Approval" -Method "GET" -Path "/api/v1/approvals/{request_id}" -StatusCode $det.status -Ok $det.ok -Notes "request_id=$rid" -Snippet (Format-Snippet $det.body) -Headers @{})
  }
} catch {}

# 15) CORS Preflight (single representative path)
try {
  $pf = Invoke-WebRequest -Method Options -Uri ($base + "/api/v1/chat/") -Headers @{ Origin=$OriginForPreflight; "Access-Control-Request-Method"="POST"; "Access-Control-Request-Headers"="content-type,accept,authorization" } -ErrorAction Stop
  $results += (New-Result -Name "CORS Preflight" -Method "OPTIONS" -Path "/api/v1/chat/" -StatusCode ([int]$pf.StatusCode) -Ok ($pf.StatusCode -in 200,204) -Notes "Origin=$OriginForPreflight" -Snippet "" -Headers $pf.Headers)
} catch {
  $st = 0; try { $st = $_.Exception.Response.StatusCode.value__ } catch {}
  $results += (New-Result -Name "CORS Preflight" -Method "OPTIONS" -Path "/api/v1/chat/" -StatusCode $st -Ok $false -Notes "Origin=$OriginForPreflight (failed)" -Snippet "" -Headers @{})
}

# 7) Summarize to Markdown
$ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss K")
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# API Verification Report")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("- Base URL: $base")
[void]$sb.AppendLine("- Generated at: $ts")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Summary")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Endpoint | Method | Status | OK | Note |")
[void]$sb.AppendLine("|---|---:|---:|---:|---|")
foreach ($res in $results) {
  $ok = if ($res.ok) { "✅" } else { "❌" }
  [void]$sb.AppendLine("| $($res.path) | $($res.method) | $($res.status) | $ok | $($res.notes) |")
}
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Details")
foreach ($res in $results) {
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("### $($res.name)")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("- Path: $($res.path)")
  [void]$sb.AppendLine("- Method: $($res.method)")
  [void]$sb.AppendLine("- Status: $($res.status)")
  [void]$sb.AppendLine("- OK: $($res.ok)")
  if ($res.notes) { [void]$sb.AppendLine("- Notes: $($res.notes)") }
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("Response snippet:")
  [void]$sb.AppendLine("")
  $code = ("" + $res.snippet)
  [void]$sb.AppendLine('```')
  [void]$sb.AppendLine($code)
  [void]$sb.AppendLine('```')
}

New-Item -ItemType Directory -Path (Split-Path $OutPath) -Force | Out-Null
Set-Content -Path $OutPath -Value $sb.ToString() -Encoding UTF8

Write-Host "Report saved to $OutPath" -ForegroundColor Green

