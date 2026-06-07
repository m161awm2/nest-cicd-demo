# nest-cicd-demo

NestJS 기반의 간단한 웹 서버를 GitHub Actions로 Amazon Linux 2023 EC2에 자동 배포하는 CI/CD 예제입니다.

발표용 핵심 문장:

> CI/CD는 사람이 직접 하던 배포 과정을 자동화해서, 코드를 빠르고 안정적으로 서비스에 반영하는 방식이다.

## 1. 프로젝트 소개

이 프로젝트는 Docker나 Kubernetes 없이, EC2 서버에 직접 접속해서 NestJS 애플리케이션을 배포하는 가장 기본적인 CI/CD 흐름을 보여줍니다.

- NestJS + TypeScript 웹 서버
- `public/index.html`, `public/style.css`, `public/script.js` 정적 페이지
- `GET /api/time` 서버 시간 API
- PM2를 이용한 Node.js 프로세스 관리
- GitHub Actions에서 SSH로 EC2에 접속해 자동 배포

## 2. 전체 구조

```text
nest-cicd-demo/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
│   └── app.e2e-spec.ts
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

각 파일의 역할:

- `src/main.ts`: NestJS 앱 시작 파일입니다. `0.0.0.0`과 `process.env.PORT || 3000`으로 서버를 실행합니다.
- `src/app.module.ts`: `.env` 로딩과 `public` 폴더 정적 파일 서빙을 설정합니다.
- `src/app.controller.ts`: `/api/time` API 라우터를 제공합니다.
- `src/app.service.ts`: 현재 서버 시간을 JSON 형태로 만들어 반환합니다.
- `public/index.html`: `/` 경로에서 보이는 HTML 페이지입니다.
- `public/style.css`: 발표용으로 보기 좋은 화면 스타일입니다.
- `public/script.js`: `/api/time`을 호출해서 서버 시간을 화면에 표시합니다.
- `.github/workflows/deploy.yml`: main 브랜치 push 시 EC2에 자동 배포하는 GitHub Actions 워크플로입니다.
- `.env.example`: 환경 변수 예시 파일입니다.

## 3. 로컬 실행 방법

macOS 로컬 개발 환경 기준입니다.

```bash
npm install
cp .env.example .env
npm run start:dev
```

브라우저에서 접속합니다.

```text
http://localhost:3000
```

API만 확인하려면 아래 명령어를 실행합니다.

```bash
curl http://localhost:3000/api/time
```

빌드 확인:

```bash
npm run build
```

프로덕션 실행:

```bash
npm run start:prod
```

필요한 패키지를 직접 설치해야 하는 경우:

```bash
npm install @nestjs/config @nestjs/serve-static
```

## 4. EC2 최초 세팅 방법

Amazon Linux 2023 기준입니다.

### 4-1. 패키지 업데이트와 Git 설치

```bash
sudo dnf update -y
sudo dnf install git -y
```

### 4-2. Node.js 확인 및 설치

먼저 Node.js와 npm이 있는지 확인합니다.

```bash
node -v
npm -v
```

없다면 Amazon Linux 2023에서 Node.js를 설치합니다.

```bash
sudo dnf install nodejs npm -y
node -v
npm -v
```

더 최신 Node.js가 필요하면 NodeSource를 사용할 수 있습니다.

```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install nodejs -y
node -v
npm -v
```

### 4-3. PM2 설치

```bash
sudo npm install -g pm2
pm2 -v
```

### 4-4. 프로젝트 최초 clone

GitHub 레포지토리 URL은 본인 계정에 맞게 바꿉니다.

```bash
cd /home/ec2-user
git clone https://github.com/YOUR_GITHUB_ID/nest-cicd-demo.git
cd /home/ec2-user/nest-cicd-demo
```

### 4-5. 최초 수동 실행

```bash
npm install
npm run build
pm2 start dist/main.js --name nest-cicd-demo
pm2 save
```

서버 내부에서 확인합니다.

```bash
curl http://localhost:3000
curl http://localhost:3000/api/time
```

### 4-6. EC2 보안 그룹 설정

AWS 콘솔에서 해당 EC2 인스턴스의 Security Group 인바운드 규칙에 아래 항목을 추가합니다.

```text
Type: Custom TCP
Port: 3000
Source: 본인 IP 또는 테스트용 0.0.0.0/0
```

운영 환경에서는 `0.0.0.0/0` 전체 공개보다 필요한 IP 또는 로드 밸런서를 통해 제한하는 편이 좋습니다.

## 5. GitHub 레포지토리 생성 및 push 방법

GitHub CLI인 `gh`가 설치되어 있는지 확인합니다.

```bash
gh --version
```

macOS에서 GitHub CLI가 없다면 Homebrew로 설치합니다.

```bash
brew install gh
```

GitHub 로그인 상태를 확인합니다.

```bash
gh auth status
```

로그인이 안 되어 있다면 로그인합니다.

```bash
gh auth login
```

### 방법 A. 한 번에 레포지토리 생성과 push

프로젝트 루트에서 실행합니다.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
gh repo create nest-cicd-demo --public --source=. --remote=origin --push
```

### 방법 B. 직접 git 명령어 흐름으로 진행

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
gh repo create nest-cicd-demo --public --source=. --remote=origin --push
```

이미 `nest-cicd-demo`라는 GitHub 레포지토리가 있으면 에러가 날 수 있습니다. 그럴 때는 대체 이름을 사용합니다.

```bash
gh repo create nest-cicd-demo-v2 --public --source=. --remote=origin --push
```

대체 이름을 사용했다면 EC2에서 clone할 때도 같은 레포지토리 이름을 사용해야 합니다.

## 6. GitHub Secrets 등록 방법

GitHub Actions가 EC2에 SSH로 접속하려면 Repository Secrets를 등록해야 합니다.

GitHub Repository 페이지에서 아래 경로로 이동합니다.

```text
Settings → Secrets and variables → Actions → New repository secret
```

등록할 Secrets:

| 이름 | 값 |
| --- | --- |
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 |
| `EC2_USER` | Amazon Linux 2023이면 보통 `ec2-user` |
| `EC2_SSH_KEY` | `.pem` 키 파일 내용 전체 |
| `EC2_PORT` | 기본값 `22` |

`EC2_SSH_KEY` 등록 시 주의사항:

- `.pem` 파일 내용을 그대로 복사합니다.
- `-----BEGIN ...-----`부터 `-----END ...-----`까지 포함해야 합니다.
- 줄바꿈이 깨지지 않게 전체 내용을 붙여넣습니다.
- 이 값은 GitHub Repository Settings의 Actions Secrets에 직접 등록합니다.

예시:

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

## 7. GitHub Actions 배포 흐름

`.github/workflows/deploy.yml`은 main 브랜치에 push될 때 자동 실행됩니다.

흐름:

```text
GitHub Push → GitHub Actions → EC2 SSH 접속 → git pull origin main → npm ci → npm run build → PM2 재시작
```

워크플로가 EC2에서 실행하는 핵심 명령:

```bash
cd /home/ec2-user/nest-cicd-demo
git pull origin main
npm ci
npm run build
pm2 restart nest-cicd-demo || pm2 start dist/main.js --name nest-cicd-demo
pm2 save
```

중요: EC2에 `/home/ec2-user/nest-cicd-demo` 폴더가 아직 없다면 GitHub Actions가 실패합니다. 최초 1회는 EC2에서 `git clone`과 PM2 최초 실행을 먼저 해주세요.

## 8. 수동 배포 방식과 CI/CD 방식 비교

기존 방식:

- EC2에 직접 접속
- `git pull`
- `npm run build`
- `pm2 restart`

CI/CD 방식:

- GitHub에 push
- GitHub Actions 자동 실행
- EC2에 자동 접속
- 자동 빌드 및 재시작

비교 문장:

```text
수동 배포는 사람이 서버에 접속해 명령어를 직접 실행하는 방식이고,
CI/CD 배포는 GitHub에 코드를 올리는 순간 정해진 배포 절차가 자동으로 실행되는 방식입니다.
```

## 9. 발표에서 설명하기 좋은 핵심 문장

- 이 예제는 Docker 없이 EC2에 직접 배포하는 가장 단순한 CI/CD 구조입니다.
- NestJS 서버는 `0.0.0.0:3000`에서 실행되므로 EC2 외부에서도 접근할 수 있습니다.
- GitHub Actions는 main 브랜치 push를 감지해 EC2에 SSH로 접속합니다.
- EC2에서는 최신 코드를 pull 받고, 의존성을 설치하고, 빌드한 뒤 PM2로 서버를 재시작합니다.
- PM2는 Node.js 애플리케이션을 백그라운드에서 계속 실행해주는 프로세스 매니저입니다.
- CI/CD는 사람이 직접 하던 배포 과정을 자동화해서, 코드를 빠르고 안정적으로 서비스에 반영하는 방식이다.

## 10. 문제 발생 시 확인할 명령어

EC2에서 PM2 상태 확인:

```bash
pm2 list
pm2 logs nest-cicd-demo
```

3000번 포트 리스닝 확인:

```bash
sudo ss -ltnp | grep 3000
```

서버 응답 확인:

```bash
curl http://localhost:3000
curl http://localhost:3000/api/time
```

Git 상태 확인:

```bash
git status
git pull origin main
```

GitHub Actions 실패 시 확인할 것:

- Repository Secrets 이름이 정확한지 확인합니다.
- `EC2_SSH_KEY`에 pem 파일 내용 전체가 들어갔는지 확인합니다.
- EC2 보안 그룹에서 SSH 22번 포트가 GitHub Actions 접속을 허용하는지 확인합니다.
- EC2에 `/home/ec2-user/nest-cicd-demo` 폴더가 있는지 확인합니다.
- EC2에서 `node -v`, `npm -v`, `pm2 -v`가 정상 출력되는지 확인합니다.

## 11. 생성한 프로젝트를 실제로 실행하는 순서

1. 로컬에서 프로젝트 폴더로 이동합니다.

```bash
cd nest-cicd-demo
```

2. 의존성을 설치합니다.

```bash
npm install
```

3. 환경 변수 파일을 만듭니다.

```bash
cp .env.example .env
```

4. 로컬 서버를 실행합니다.

```bash
npm run start:dev
```

5. 브라우저에서 `http://localhost:3000`에 접속해 화면과 서버 시간을 확인합니다.

6. GitHub CLI 로그인 상태를 확인합니다.

```bash
gh auth status
```

7. GitHub 레포지토리를 생성하고 최초 push합니다.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
gh repo create nest-cicd-demo --public --source=. --remote=origin --push
```

8. EC2에 접속해서 Node.js, Git, PM2를 설치합니다.

```bash
sudo dnf update -y
sudo dnf install git nodejs npm -y
sudo npm install -g pm2
```

9. EC2에서 프로젝트를 최초 clone하고 실행합니다.

```bash
cd /home/ec2-user
git clone https://github.com/YOUR_GITHUB_ID/nest-cicd-demo.git
cd nest-cicd-demo
npm install
npm run build
pm2 start dist/main.js --name nest-cicd-demo
pm2 save
```

10. GitHub Repository Settings에서 `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_PORT` Secrets를 등록합니다.

11. 로컬에서 코드를 수정한 뒤 main 브랜치에 push합니다.

```bash
git add .
git commit -m "Update demo"
git push origin main
```

12. GitHub Actions 탭에서 배포 워크플로 실행 결과를 확인합니다.
