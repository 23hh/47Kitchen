# Chrome Buildpack 업데이트 가이드

## 문제

기존 Chrome buildpack들이 end of life에 도달하여 배포가 실패합니다:
- `heroku-buildpack-chromedriver` ❌
- `heroku-buildpack-google-chrome` ❌

## 해결 방법

### 1. 기존 Buildpack 제거

```bash
heroku buildpacks:remove https://github.com/heroku/heroku-buildpack-chromedriver -a kitchen47
heroku buildpacks:remove https://github.com/heroku/heroku-buildpack-google-chrome -a kitchen47
```

### 2. 새로운 Buildpack 추가

```bash
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-chrome-for-testing -a kitchen47
```

### 3. Buildpack 순서 확인

```bash
heroku buildpacks -a kitchen47
```

**예상 순서:**
1. `heroku/nodejs`
2. `heroku/python`
3. `heroku-buildpack-chrome-for-testing`

### 4. 재배포

```bash
git push heroku main
```

## 추가 변경사항

### runtime.txt → .python-version

`runtime.txt` 파일이 deprecated되어 `.python-version` 파일로 변경했습니다:
- 삭제: `runtime.txt` (python-3.11.6)
- 생성: `.python-version` (3.11)

이렇게 하면 최신 패치 버전(3.11.14 등)을 자동으로 받을 수 있습니다.

## 코드 변경사항

`scraper/scraper.py`가 새로운 buildpack의 경로를 자동으로 감지하도록 업데이트되었습니다:
- `/app/.chrome-for-testing/chrome/linux-*/chrome-linux64/chrome`
- `/app/.chrome-for-testing/chromedriver/linux-*/chromedriver-linux64/chromedriver`

## 확인

재배포 후 로그에서 Chrome 경로가 표시되는지 확인:

```bash
heroku logs --tail -a kitchen47
```

다음과 같은 로그가 보여야 합니다:
```
🔧 Chrome binary: /app/.chrome-for-testing/chrome/linux-.../chrome-linux64/chrome
🔧 ChromeDriver path: /app/.chrome-for-testing/chromedriver/linux-.../chromedriver-linux64/chromedriver
```

