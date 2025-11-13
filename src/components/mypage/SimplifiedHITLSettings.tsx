"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, TrendingUp } from "lucide-react";

interface SimplifiedHITLSettingsProps {
  className?: string;
}

/**
 * SimplifiedHITLSettings - HITL Control
 *
 * 3-stage system:
 * - Trading: Always enabled (fixed)
 * - Research: On/Off toggle
 * - Portfolio Rebalancing: On/Off toggle (linked with Research)
 */
export default function SimplifiedHITLSettings({
  className = "",
}: SimplifiedHITLSettingsProps) {
  // Research and Portfolio are linked via master switch
  const [isHITLEnabled, setIsHITLEnabled] = useState(false);

  const handleMasterToggle = () => {
    setIsHITLEnabled(!isHITLEnabled);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
          HITL Control
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose between AI automation and manual approval. Toggle ON to approve actions yourself, or leave OFF for AI to proceed automatically.
        </p>
      </div>

      {/* Master Toggle */}
      <div
        className="flex items-center justify-between p-4 rounded-xl border-2"
        style={{
          backgroundColor: "var(--container-background)",
          borderColor: "var(--border-default)"
        }}
      >
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">
            Manual Approval Mode
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Enable to approve Research and Portfolio actions yourself. Disable for AI auto-execution.
          </p>
        </div>
        <button
          onClick={handleMasterToggle}
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
          style={{
            backgroundColor: isHITLEnabled ? "var(--primary-500)" : "#d1d5db"
          }}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              isHITLEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trading Card */}
        <div
          className="p-5 rounded-xl border-2 transition-all"
          style={{
            backgroundColor: "var(--primary-50)",
            borderColor: "var(--primary-500)",
          }}
        >
          <div className="flex items-start gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-[var(--primary-500)]" strokeWidth={1.5} />
            <h4 className="font-semibold text-[var(--text-primary)]">Trading</h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Final approval before executing trade orders (always required)
          </p>
          <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Review risk analysis results</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Confirm portfolio changes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Approve order quantity and price</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex justify-center">
            <span
              className="px-3 py-1 text-xs font-semibold rounded-full"
              style={{
                backgroundColor: "var(--primary-500)",
                color: "white",
              }}
            >
              Manual Approval
            </span>
          </div>
        </div>

        {/* Research Card */}
        <div
          className="p-5 rounded-xl border-2 transition-all"
          style={{
            backgroundColor: isHITLEnabled ? "var(--primary-50)" : "var(--container-background)",
            borderColor: isHITLEnabled ? "var(--primary-500)" : "var(--border-default)",
          }}
        >
          <div className="flex items-start gap-2 mb-3">
            <Search className="w-5 h-5 text-[var(--primary-500)]" strokeWidth={1.5} />
            <h4 className="font-semibold text-[var(--text-primary)]">Research</h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Approval request before executing stock analysis
          </p>
          <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Set analysis depth level</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Define analysis scope</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Select data sources</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex justify-center">
            {isHITLEnabled ? (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--primary-500)",
                  color: "white",
                }}
              >
                Manual Approval
              </span>
            ) : (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--border-secondary)",
                  color: "var(--text-secondary)",
                }}
              >
                Auto Execution
              </span>
            )}
          </div>
        </div>

        {/* Portfolio Rebalancing Card */}
        <div
          className="p-5 rounded-xl border-2 transition-all"
          style={{
            backgroundColor: isHITLEnabled ? "var(--primary-50)" : "var(--container-background)",
            borderColor: isHITLEnabled ? "var(--primary-500)" : "var(--border-default)",
          }}
        >
          <div className="flex items-start gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-[var(--primary-500)]" strokeWidth={1.5} />
            <h4 className="font-semibold text-[var(--text-primary)]">Portfolio Rebalancing</h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Approve portfolio rebalancing strategy
          </p>
          <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Adjust rebalancing intensity</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Determine investment direction</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary-500)]">•</span>
              <span>Reflect preferred sectors</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex justify-center">
            {isHITLEnabled ? (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--primary-500)",
                  color: "white",
                }}
              >
                Manual Approval
              </span>
            ) : (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "var(--border-secondary)",
                  color: "var(--text-secondary)",
                }}
              >
                Auto Execution
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--warning-50)",
          borderColor: "var(--warning-200)"
        }}
      >
        <p className="text-sm text-[var(--warning-700)] dark:text-[var(--warning-300)]">
          <strong>Note:</strong> Toggle ON = You approve each action manually. Toggle OFF = AI executes automatically.
          Trading always requires your approval for safety.
        </p>
      </div>
    </div>
  );
}
