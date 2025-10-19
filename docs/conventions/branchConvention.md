🌲 **브랜치는 다음과 같은 네이밍 컨벤션을 따릅니다.**

```
main/master - 제품 출시 브랜치
develop - 다음 출시 버전 개발 브랜치
feature - 기능 개발 브랜치
hotfix - 출시 버전 버그 수정 브랜치
release - 이번 출시 버전 준비 브랜치
```

🔄 **feature 브랜치는 다음 형식을 따릅니다.**

```
feature/[이슈번호]-기능설명
예시: feature/123-login-ui
```

🔨 **hotfix 브랜치는 다음 형식을 따릅니다.**

```
hotfix/[이슈번호]-버그설명
예시: hotfix/456-login-error
```

📦 **release 브랜치는 다음 형식을 따릅니다.**

```
release/v[major].[minor].[patch]
예시: release/v1.2.3
```

✨ **브랜치명은 영어 소문자, 숫자, 하이픈(-)만 사용합니다.**

```
feature/login-page // good
feature/Login_Page // bad
feature/loginPage // bad
```

🔍 **브랜치명은 구체적이고 명확하게 작성합니다.**

```
feature/123-add-user-profile-image // good
feature/123-add-function // bad
```

🗑 **작업이 완료된 브랜치는 머지 후 삭제합니다.**

```
1. feature 브랜치는 develop에 머지 후 삭제
2. hotfix 브랜치는 main과 develop에 머지 후 삭제
3. release 브랜치는 main과 develop에 머지 후 삭제
```