# 🛡️ AI Fake News Detector

A real-time fake news detection system powered by AI to help verify news claims and articles.

## 🌟 Features

- **🤖 AI-Powered Analysis**: Advanced fact-checking using multiple AI models
- **⚡ Real-time Verification**: Get results in seconds
- **📱 Modern UI**: Clean, responsive design
- **📊 Confidence Scoring**: Detailed accuracy percentages
- **📝 Analysis History**: Track your previous fact-checks

## 🏗️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: FastAPI (Python)
- **AI**: Google Gemini, HuggingFace
- **Deployment**: Netlify + Render

## 🛠️ Technologies Used

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.13** - Latest Python version with async support
- **Google Generative AI** - Gemini 1.5 Flash model for fact-checking
- **HuggingFace Transformers** - BART-large-MNLI for text classification
- **Uvicorn** - ASGI server for production deployment
- **Pydantic** - Data validation and serialization
- **aiohttp** - Async HTTP client for API calls

### Frontend
- **HTML5** - Modern semantic markup
- **CSS3** - Advanced styling with gradients and animations
- **Vanilla JavaScript** - Pure JS with async/await
- **Font Awesome** - Professional icons
- **Inter Font** - Modern typography

### AI Models
- **Gemini 1.5 Flash** - Google's latest multimodal AI model
- **BART-large-MNLI** - Facebook's transformer for natural language inference

## 🚀 Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vanshbadjate07/Fake-News-Detection.git
   cd Fake-News-Detection
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Add API Keys** (create `.env` file in backend folder):
   ```env
   GOOGLE_GEMINI_API_KEY=your_key_here
   HUGGINGFACE_API_TOKEN=your_token_here
   ```

4. **Run the application**:
   ```bash
   # Backend
   python main.py
   
   # Frontend (new terminal)
   cd ../frontend
   python -m http.server 3000
   ```


## 📖 API Documentation

### Analyze News Endpoint

**POST** `/api/analyze/`

**Request Body:**
```json
{
  "text": "News article or claim to verify",
  "url": "Optional URL to analyze",
  "image": "Optional image for OCR (future feature)"
}
```

**Response:**
```json
{
  "status": "✅ Real | ❌ Fake | ⚠️ Unverified",
  "confidence": 0.95,
  "summary": "Detailed explanation with facts and context",
  "sources": [
    {
      "title": "Source name",
      "url": "Source URL"
    }
  ],
  "is_fake": false
}
```

## 🎯 How It Works

1. **Input Processing**: User submits news text or claim
2. **Gemini Analysis**: AI searches knowledge base for factual verification
3. **Structured Response**: Parses verdict, confidence, and explanation
4. **Fallback System**: Uses HuggingFace if Gemini fails
5. **Result Display**: Shows status, confidence, and detailed explanation

## 🧪 Example Usage

### Testing Claims

**True Claim:**
```
Input: "Narendra Modi is PM of India"
Output: ✅ Real (100% confidence)
```

**False Claim:**
```
Input: "The earth is flat"
Output: ❌ Fake (95% confidence)
```

## 📁 Project Structure

```
FakeNewsDetector/
├── README.md
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── .env                # Environment variables
│   └── venv/               # Virtual environment
└── frontend/
    ├── index.html          # Main HTML file
    ├── style.css           # Styling and animations
    └── script.js           # Frontend logic
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `HUGGINGFACE_API_TOKEN` | HuggingFace API token | Yes |

### 🔑 API Keys

Get free API keys from:
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini API
- [HuggingFace](https://huggingface.co/) - AI Models

## 🌐 Live Demo

**Frontend**: [https://fake-newsdetection.netlify.app/](https://fake-newsdetection.netlify.app/)

## 🚀 Deployment

- **Frontend**: Netlify (Static hosting)
- **Backend**: Render (Python hosting)
- **Environment**: Production-ready with HTTPS

## 🧪 Usage

1. Enter news text or article in the input field
2. Click "Analyze Now" to get AI verification
3. View results with confidence scores
4. Check analysis history for previous searches

## 🤝 Contributing

Feel free to fork this repository and submit pull requests for improvements.

## 📄 License

MIT License - feel free to use this project.

---

**⭐ Star this repository if you found it helpful!**

**👨‍💻 Author**

**© 2025 Developed by [Vansh Badjate](https://github.com/vanshbadjate07)**
