# 🤖 Multi-Agent-Career-Assistant

> Upload your resume. Let AI agents do the job hunting.

A full-stack AI-powered web application that analyzes your resume and autonomously discovers, scores, and ranks matching jobs from LinkedIn — powered by a multi-agent LangGraph pipeline running on Groq's ultra-fast LLMs.

---

## 📸 Demo

```
Upload PDF Resume
      ↓
🔨 Resume Parser     →  Extracts skills, experience, role
      ↓
⚙️  Keyword Agent    →  Generates 3 optimized LinkedIn search terms
      ↓
📐 URL Framer        →  Builds targeted LinkedIn search URLs
      ↓
🔍 Job Scraper       →  Fetches real listings from LinkedIn
      ↓
📊 Synthesizer       →  Scores each job, finds skill gaps, writes analysis
      ↓
Results Dashboard    →  Ranked jobs, match scores, cover letters
```

---

## ✨ Features

- **📄 PDF Resume Parsing** — Automatically extracts your skills, experience, and role from any PDF resume
- **🔍 LinkedIn Job Discovery** — Custom scraper finds real, live job listings matching your profile
- **⚡ Skill Gap Detection** — Identifies exactly what skills you're missing across all listings
- **🎯 Location-Aware Search** — Target jobs in any city or region
- **🤖 Sequential Agent Animation** — Visual pipeline showing each agent working in real time
- **📋 Application Tracker** — Track applied jobs, statuses, and follow-up reminders

---

## 🧠 How the Multi-Agent Pipeline Works

The backend uses **LangGraph** to orchestrate 5 specialized agents that pass state to each other in a linear workflow:

### Agent 1 — Resume Analyzer
Reads the uploaded PDF resume and generates a structured summary of the candidate's skills, experience, years of work, and target role.

### Agent 2 — Keyword Generator *(Llama 3.1 8B via Groq)*
Takes the resume summary and generates exactly 3 optimized LinkedIn job search keywords tailored to the candidate's profile and target location. Uses the smaller, faster model for this lightweight task.

### Agent 3 — URL Framer
Constructs valid LinkedIn job search URLs from the generated keywords and location using `urllib.parse`. Handles encoding, pagination parameters, and regional targeting.

### Agent 4 — Job Searcher
Passes each URL through a custom LinkedIn scraper built with Playwright and BeautifulSoup. Collects up to 10 real job listings including title, company, location, description, and apply link.

### Agent 5 — Synthesizer *(Llama 3.3 70B Versatile via Groq)*
Compares the resume against the top job listings. For each job, provides: why it's a good fit, skill gaps, a match score out of 100, and the direct application link. Uses the larger, more powerful model for this complex reasoning task.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Vite |
| **Backend** | Python 3.11, FastAPI |
| **AI Orchestration** | LangGraph, LangChain |
| **LLMs** | Groq — Llama 3.1 8B + Llama 3.3 70B Versatile |
| **Scraping** | Playwright, BeautifulSoup4, Cloudscraper |
| **PDF Parsing** | PyMuPDF / pdfplumber |
| **Database** | PostgreSQL |
| **API Communication** | REST, FormData, CORS |
| **Frontend Dev** | Anthropic Claude (UI design & component generation) |
| **Backend Dev** | Antigravity IDE (AI-assisted code generation) |

---

## 📁 Project Structure

```
Lienkdn/
│
├── Backend/
│   │
│   ├── API/
│   │   └── routes.py               # FastAPI endpoints
│   │
│   ├── agentic.py                  # LangGraph multi-agent workflow
│   ├── lang.py                     # LangChain configuration & tools
│   ├── lienkdnscrapper.py          # Custom LinkedIn scraper (Playwright + BS4)
│   ├── resume.py                   # PDF resume parser
│   ├── summariserr.py              # Resume summarization agent
│   ├── variouswebsite.py           # Multi-source job scraper
│   ├── agent_debug.txt             # Agent run logs (debug)
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # API keys (never commit this)
│
└── Frontend/
    └── my-app/
        ├── src/
        │   ├── App.jsx                      # Root component
        │   ├── JobHuntingAssistant.jsx      # Main dashboard UI
        │   ├── SequentialAgents.jsx         # Agent pipeline animation
        │   ├── index.css                    # Tailwind base styles
        │   └── main.jsx                     # React entry point
        ├── public/
        ├── index.html
        ├── vite.config.js
        ├── tailwind.config.js
        ├── postcss.config.js
        └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- A Groq API key (free at [console.groq.com](https://console.groq.com))

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Multi-Agent-Career-Assistant.git
cd Multi-Agent-Career-Assistant
```

---

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/careerjobs
```

Start the FastAPI server:
```bash
uvicorn api.routes:app --reload --port 8001
```

---

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 4. Run both simultaneously

```bash
# Terminal 1
cd backend && uvicorn api.routes:app --reload --port 8001

# Terminal 2
cd frontend && npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze-resume` | Upload PDF + location, runs full agent pipeline |
| `GET` | `/jobs` | Fetch all stored job listings |
| `GET` | `/health` | Health check |

### Example request

```bash
curl -X POST "http://localhost:8001/analyze-resume?location=Bangalore%2C%20India" \
  -F "file=@Resume.pdf"
```

### Example response

```json
{
  "resume_summary": "Experienced Python developer with PostgreSQL, FastAPI...",
  "search_keywords": ["Data Engineer", "Python Developer", "Backend Engineer"],
  "job_listings": [...],
  "final_analysis": "Job 1: Infosys Data Engineer — 92% match. Strong fit due to..."
}
```

---

## ⚙️ Agent State Schema

```python
class AgentState(TypedDict):
    resume_path: str         # Path to uploaded PDF
    location: str            # Target job location
    resume_summary: str      # Output of Agent 1
    search_keywords: list    # Output of Agent 2
    search_urls: list        # Output of Agent 3
    job_listings: list       # Output of Agent 4
    final_analysis: str      # Output of Agent 5
    error: str               # Error message if any agent fails
```

---

## 🧩 LangGraph Workflow

```python
workflow = StateGraph(AgentState)

workflow.add_node("analyze_resume", resume_analyzer_node)
workflow.add_node("generate_keywords", keyword_generator_node)
workflow.add_node("frame_urls", url_framer_node)
workflow.add_node("search_jobs", job_searcher_node)
workflow.add_node("synthesize", synthesizer_node)

workflow.set_entry_point("analyze_resume")
workflow.add_edge("analyze_resume", "generate_keywords")
workflow.add_edge("generate_keywords", "frame_urls")
workflow.add_edge("frame_urls", "search_jobs")
workflow.add_edge("search_jobs", "synthesize")
workflow.add_edge("synthesize", END)
```

---

## 🖥️ Frontend Pages

### Upload Screen
Drag and drop or click to upload your PDF resume. Enter your target location.

### Agent Pipeline Animation
Sequential animation showing each agent working one at a time — live step logs, progress bars, and bouncing tool emojis.

### Results Dashboard
Four tabs:
- **Jobs** — Ranked job cards with match score rings, skill tags, missing skills highlighted
- **Resume** — AI-generated summary with strengths and improvement suggestions
- **Skill Gaps** — Visual bar chart of missing skills ranked by job market demand
- **Tracker** — Application tracking board with status and follow-up reminders

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `DATABASE_URL` | PostgreSQL connection string |

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

## 📦 Requirements

```txt
fastapi
uvicorn
python-multipart
langchain
langchain-groq
langgraph
playwright
beautifulsoup4
cloudscraper
pdfplumber
pymupdf
psycopg2-binary
python-dotenv
shutil
```

---

## 🗺️ Roadmap

- [ ] Auto-apply agent for easy application forms
- [ ] Real-time WebSocket streaming of agent progress
- [ ] Email/WhatsApp alerts for new matching jobs
- [ ] Multi-resume comparison
- [ ] Salary intelligence agent
- [ ] Interview prep question generator
- [ ] Deploy to Railway / Render

---

## 👤 Author

**Pranav P V**
- LinkedIn: [linkedin.com/in/pranav-pv-782382217](https://linkedin.com/in/pranav-pv-782382217)
- GitHub: [@pranvpv](https://github.com/pranvpv)
- Email: pranav231019@gmail.com

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [LangChain](https://langchain.com) & [LangGraph](https://langchain-ai.github.io/langgraph/) for agent orchestration
- [Groq](https://groq.com) for blazing fast LLM inference
- [Anthropic Claude](https://claude.ai) for UI design, React component generation, and frontend development assistance
- [Antigravity IDE](https://antigravity.dev) for AI-assisted backend development and code generation
