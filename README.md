# 🔍 TrueVerse: Fake News Detection System

A comprehensive, AI-powered platform that classifies news statements, URLs, and PDFs as **real** or **fake** using advanced NLP models. Built with a modern React frontend, FastAPI backend, MongoDB integration, and a custom Chrome Browser extension!

---

## ⚡ Quick Start (5-Minute Setup)

### **1️⃣ Clone & Install Dependencies**
```bash
git clone https://github.com/BharathTT/FakeNewsDetectorUsingBert.git
cd FakeNewsDetectorUsingBert

# Setup Python Virtual Environment for Backend
python -m venv venv

# Activate Virtual Environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### **2️⃣ Configure Environment (.env)**
In the `app/` folder, create a `.env` file with your credentials:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0...
MONGO_DB_NAME=trueverse
GOOGLE_FACTCHECK_API_KEY=your_google_api_key
```

### **3️⃣ Run the System**
Open **two terminals**:

**Terminal 1 (Backend - FastAPI):**
```bash
cd app
# Start the backend server
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend - React/Vite):**
```bash
cd frontend
# Install node modules and start frontend
npm install
npx vite --host 127.0.0.1 --port 5173
```
Visit **http://127.0.0.1:5173** in your browser!

---

## ✨ Amazing Features

### 🧩 **TrueVerse Chrome Extension**
Verify news anywhere on the web instantly without opening the app!
1. Open `chrome://extensions/` in your browser and enable **Developer Mode**.
2. Click **Load unpacked** and select the `extension/` folder in this repo.
3. Highlight any text on any website, click the "TV" icon in your toolbar, and get an instant AI credibility verdict!

### 🧠 **Explainable AI Models**
- **Hybrid Model**: BERT embeddings + Random Forest classifier.
- **Google Fact Check API**: Automatically cross-references claims with global fact-checkers.
- **Stylistic Analysis**: Detects sensationalism, hedging, and emotional manipulation in writing.
- **Sentence-level Claims**: Breaks down long articles to analyze specific claims.

### 🌐 **Modern Architecture**
- **React + Vite Frontend**: Beautiful, dark-mode glassmorphism UI.
- **MongoDB Atlas Auth**: Secure user accounts, login, and verification history.
- **PDF Forensics**: Upload `.pdf` documents to automatically extract and verify text using PyMuPDF.
- **URL Scraping**: Paste any news link (BBC, CNN, NDTV) and the AI reads and analyzes the article for you.

---

## 🏗️ Architecture Stack

```plaintext
┌─────────────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│     Frontend UI         │     │     FastAPI Backend   │     │    External APIs       │
│  - React.js / Vite      │ ──▶ │  - Text & URL parsing │ ──▶ │  - Google Fact Check   │
│  - Chrome Extension     │     │  - PDF Extraction     │     │  - MongoDB Atlas Auth  │
└─────────────────────────┘     └───────────────────────┘     └────────────────────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │       AI Engine       │
                                │  - BERT Transformer   │
                                │  - Hybrid Classifiers │
                                └───────────────────────┘
```

---

## 📊 The LIAR Dataset
The AI is trained on the benchmark LIAR Dataset containing 12,836 human-labeled political statements from PolitiFact.
* **Train**: 10,269 | **Val**: 1,284 | **Test**: 1,283

*(To train the models yourself from scratch, simply run `python train.py` inside the `app/` directory).*

---

## 💻 Usage & API Examples

You can test the backend API directly using cURL:

```bash
# Test Text Analysis
curl -X POST "http://127.0.0.1:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"text": "Breaking news: Aliens found on Mars!", "model": "hybrid"}'

# Test URL Analysis
curl -X POST "http://127.0.0.1:8000/predict_url" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.bbc.com/news/...", "model": "auto"}'
```

---

## 🤝 Contributing
Contributions are always welcome! Feel free to open an issue or submit a pull request.
