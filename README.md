# Pringles
- 2025-2 산학프로젝트

<br/>

## 👤 Members
- 프로덕트 오너(Product Owner) : 박세민
- 스크럼 마스터(Scrum Master) : 김규현
- TI 매니저(TI Manager) : 김주훈

<br/>

## 🛠️ Tech Stack

### Frontend
- React `19.2.0`
- Node.js `v22.20.0`
- npm `10.9.3`

### Backend
- Python `3.12.11`
- FastAPI `0.118.1`

<br/>

## 🔗 Link
- [notion](https://www.notion.so/Technical-Definition-Analysis-27183d64f09980dba4ccfc1c0c1e9a1a?source=copy_link)

<br/>

## Activation(백/프론트 각각 그대로 터미널에 복붙)
```
backend:
cd backend
py -3 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

frontend:
cd frontend
npm install
npm run dev
```

<br/>

## Github Push (그대로 bash에 복붙)
```
cd C:\Users\win11\Desktop\assignment\Pringles

# Git 초기화
rm -rf .git
rm -f .gitattributes
git init
git branch -M main
git lfs install

# LFS 추적 설정
git lfs track "**/*.zip"
git lfs track "**/*.rar"
git lfs track "**/*.pdf"
git lfs track "**/*.psd"
git lfs track "**/*.mp4"
git lfs track "**/*.exe"
git lfs track "uploads/**"
git add .gitattributes
git commit -m "chore: LFS 설정"

# .gitignore
cat > .gitignore << EOL
node_modules/
.venv/
venv/
__pycache__/
*.pyc
.env
.DS_Store
EOL

# 전체 커밋
git add .
git commit -m "initial commit: 전체 프로젝트"

# 푸시
git remote add origin https://github.com/rspstat/Pringles.git
git lfs push origin main --all
git push -u origin main --force
```
