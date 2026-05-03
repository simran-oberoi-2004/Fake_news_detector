# 🚀 Trueverse: AI-Based Fake News Detection System

Trueverse is an AI-powered fake news detection platform that analyzes content and classifies it as **🟢 Real**, **🔴 Fake**, or **🟡 Uncertain**.

It combines:
- 🤖 Machine Learning
- 🧠 NLP (Natural Language Processing)
- 🌐 Google Fact Check API
- 📚 Known Facts Layer
- 🔍 Sentence-level analysis
- 🛡️ Trust & Safety review

---

## ✨ Key Features

- 📝 Text-based fake news detection  
- 🔗 URL/news article analysis  
- 📄 PDF upload & analysis  
- 🧠 Hybrid AI model (ML + rules)  
- 📚 Known Facts Layer (handles general knowledge correctly)  
- 🌐 External fact-check verification  
- 📊 Confidence score & explanation  
- 🔍 Sentence-level claim analysis  
- 🚨 Risk level & moderation decision  
- 💾 History & saved results  
- 🔗 Shareable results  
- 🎯 Interactive quiz/game for users  
- 🎨 Clean and modern UI  

---

## 🛠️ Tech Stack

### 💻 Frontend
- React.js  
- TypeScript  
- Vite  
- Tailwind CSS  
- React Router  

### ⚙️ Backend
- Python  
- FastAPI  
- Uvicorn  
- Scikit-learn  
- Transformers  
- spaCy  
- PyMuPDF  
- Requests  

---

## 📁 Project Structure


Trueverse-Ai-FakenewsDetector/
│
├── app/
│ ├── api.py
│ ├── known_facts.py
│ ├── scraper.py
│ ├── sentence_claims.py
│ ├── language_router.py
│ ├── auth_store.py
│ ├── result_store.py
│ ├── models/
│ └── .env
│
├── frontend/
│ ├── src/
│ ├── package.json
│ └── vite.config.ts
│
└── README.md


---

## ⚙️ How the System Works


User Input
↓
Text / URL / PDF Processing
↓
Language Detection 🌐
↓
Model Selection 🤖
↓
Prediction Engine 🧠
↓
Known Facts Layer 📚
↓
Google Fact Check API 🌍
↓
Sentence Analysis 🔍
↓
Trust & Safety Review 🛡️
↓
Final Result 🎯


---

## 🧩 Core Modules

### 🤖 Prediction Engine
Classifies content using hybrid ML + rule-based approach.

### 📚 Known Facts Layer (USP 🔥)
Handles general knowledge queries correctly:
- Presidents, PMs, facts
- Prevents wrong "Fake" outputs

### 🌐 Google Fact Check API
Fetches real-world verification from trusted sources.

### 🛡️ Trust & Safety Layer
Analyzes:
- Emotional manipulation  
- Exaggeration  
- Fear-based content  
- Source credibility  

### 🔍 Sentence-Level Analysis
Breaks long text → analyzes each sentence → improves accuracy.

---

## ⚡ Setup Instructions

### 1️⃣ Clone Repository

'''bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd Trueverse-Ai-FakenewsDetector
2️⃣ Backend Setup
cd app
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

Create .env file:

GOOGLE_FACTCHECK_API_KEY=your_api_key_here

Run backend:

python -m uvicorn api:app --reload

👉 Runs at:

http://127.0.0.1:8000

👉 API Docs:

http://127.0.0.1:8000/docs
3️⃣ Frontend Setup
cd frontend
npm install
npx vite

👉 Runs at:

http://localhost:5173
🧪 Sample Inputs
🔴 Fake News
BREAKING: Scientists discovered a miracle cure that eliminates all diseases instantly!

👉 Output:

High risk 🚨
Fake / Misleading
📚 Known Fact
Donald Trump president of USA

👉 Output:

Real ✅
Known Facts Layer
🌐 API Fact Check
COVID vaccines contain microchips

👉 Output:

Fake ❌
Verified by external sources
🔗 API Endpoints
Endpoint	Method	Description
/predict	POST	Analyze text
/predict_url	POST	Analyze URL
/predict_pdf	POST	Analyze PDF
/extract_pdf_text	POST	Extract PDF text
/health	GET	Server status
/history	GET	User history
/share/create	POST	Share result
/result/{id}	GET	View shared result
🏆 Why Trueverse is Unique

✨ Not just a classifier — a complete system

Hybrid AI + rule-based logic
Real-time fact-check APIs
Known facts correction layer
Explainable results (XAI)
Sentence-level analysis
Trust & Safety scoring
Multi-input support
⚠️ Limitations
Not 100% accurate
API dependent
Needs updates for new facts
Complex sarcasm may fail
🚀 Future Scope
Real-time news scraping
Better ML models
Multilingual support
Deepfake detection
Browser extension
Auto-updating knowledge base


👩‍💻 Author

Simran Oberoi
