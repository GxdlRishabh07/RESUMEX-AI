# 📄 RESUMEX // AI — AI Resume Optimizer & ATS Scanner

> **A friendly, smart tool that helps job seekers and students beat the ATS (Applicant Tracking System) and land more interviews using Google Gemini AI.**

---

## 🌟 What is this Project About?

When you apply for a job online, your resume is usually **not** read by a human first. Instead, companies use software called an **ATS (Applicant Tracking System)** (like Workday, Greenhouse, or Lever). 

If your resume does not have the exact skills and keywords mentioned in the job description, the ATS automatically filters it out. Over **75% of resumes are rejected** this way!

**RESUMEX AI fixes this problem:**
1. You give it your **resume** and the **job description** you want to apply for.
2. The AI compares both and gives you an **ATS Compatibility Score (0 to 100)**.
3. It tells you exactly **what keywords you are missing** and what needs improvement.
4. With one click, it **rewrites your resume** into a clean, professional format with the missing keywords added naturally.
5. You can download your new resume as a **Word Document (.doc)**, **Webpage (.html)**, or **Text file (.txt)**!

---

## 🚀 How It Works (Step-by-Step)

```
[ Your Resume ] + [ Job Description ]
                 │
                 ▼
       1. ATS Score Check
   (See your score, missing skills & tips)
                 │
                 ▼
       2. AI Neural Rewrite
   (Google Gemini rewrites your resume)
                 │
                 ▼
      3. Download & Apply!
 (.doc Word / .html / .md / .txt)
```

1. **Step 1 — Input**: Paste your resume text or upload your file (**PDF**, **Word .docx**, or **.txt**).
2. **Step 2 — Job Description**: Paste the job description for the role you want.
3. **Step 3 — Check ATS Score**: Click **"Check ATS Score"** to see:
   - Your initial score (e.g. 65/100).
   - Skills you already matched (green badges).
   - Skills you are missing (red badges).
   - Practical recommendations to improve.
4. **Step 4 — Optimize Resume**: Click **"Optimize Resume"**. Google Gemini AI rewrites your resume to highlight the missing keywords while keeping your real experience truthful.
5. **Step 5 — Preview & Download**: 
   - View your resume in **Paper White** or **Dark Mode**.
   - Download it directly as a formatted **Microsoft Word (`.doc`)** document, **HTML**, **Markdown**, or **Plain Text**.

---

## 💻 Technologies Used (In Simple Terms)

| Technology | What it is | Why we use it |
| :--- | :--- | :--- |
| **React 19** | Frontend UI Library | Builds the buttons, forms, badges, and interactive user interface. |
| **TypeScript** | Typed JavaScript | Helps prevent bugs and makes the code clean and reliable. |
| **Node.js & Express** | Backend Web Server | Creates API routes that receive your resume and connect to the AI safely. |
| **Google Gemini AI** | Large Language Model (LLM) | The AI "brain" that analyzes the resume, finds missing skills, and rewrites the content. |
| **Supabase** | Database & Authentication | Lets users sign up, log in, and securely save their past resume analyses. |
| **PDF.js & Mammoth** | File Readers | Reads and extracts plain text from uploaded PDF and Word documents inside the browser. |
| **Tailwind CSS & CSS** | Styling | Makes the app look modern, sleek, and responsive on mobile and desktop. |

---

## 🧠 AI Models & How the AI Thinks

### Which AI Model is Used?
This project uses **Google Gemini Flash** (specifically `gemini-3.5-flash-lite`) using Google's official `@google/genai` library.

**Why Gemini Flash?**
- **Super Fast**: Generates analysis and rewrites in just a few seconds.
- **Accurate**: Highly capable at understanding job requirements and matching keywords.
- **Cost-Effective**: Free tier available on Google AI Studio, perfect for student projects and demos!

### How Does the AI Prompt Work?
We give the AI very specific instructions (in `src/services/promptBuilder.ts`):
- **No Lying / No Hallucinations**: The AI is strictly instructed **never** to invent fake degrees, fake companies, or fake certifications.
- **Keyword Integration**: It takes the missing skills from the job description and weaves them into your existing project descriptions.
- **The Google XYZ Formula**: It turns weak bullet points like *"Worked on website"* into strong achievement statements like *"Engineered responsive frontend using React and TypeScript, improving user engagement by 25%"*.

---

## ⚡ Key Features

- 🎯 **Real-time ATS Scoring (0-100)**: Instant feedback on how well your resume matches the job.
- 📋 **Keyword Matcher**: Visual green/red tags showing matched vs missing keywords.
- 📄 **Executive Resume Layout**: Beautiful, clean typography that recruiters love.
- 📥 **Instant Word (.doc) & HTML Downloads**: Download a ready-to-use Word file with margins and fonts pre-formatted.
- 🔒 **User Accounts & History Vault**: 
  - **Guest Mode**: Try the optimizer freely.
  - **Logged-In Mode**: Automatically save all your resume scans to your personal history dashboard.
- ⏱️ **Live Rate Limiter**: 
  - Tracks how many scans you have left (30 scans per 15 minutes).
  - Displays a real-time countdown timer in the top bar so you always know when your limit resets.

---

## 🛠️ How to Run This Project Locally (Beginner Guide)

Follow these easy steps to run the project on your computer:

### Prerequisites
Make sure you have installed:
- **Node.js** (Version 18 or newer) — [Download from nodejs.org](https://nodejs.org/)
- A code editor like **VS Code**

---

### Step 1: Clone or Download the Project
```bash
git clone https://github.com/your-username/AI-Resume-Optimizer.git
cd AI-Resume-Optimizer
```

---

### Step 2: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```
*This installs all required packages like React, Express, and the Gemini AI SDK.*

---

### Step 3: Get Your Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** and create a free key.
4. Copy the key.

---

### Step 4: Set Up Your `.env` File
Create a file named `.env` in the root folder of the project (you can copy `.env.example`):

```bash
cp .env.example .env
```

Open `.env` in your editor and paste your API key:
```env
PORT=8080
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_<your-anon-key>
```

*(Optional: If you want user login/signup to work, also add your free [Supabase](https://supabase.com) project URL and anon key into the `.env` file).*

---

### Step 5: Start the App!
Run this command in your terminal:
```bash
npm run dev
```

You will see:
```
🚀 AI Resume Optimizer server listening on http://localhost:8080
```

Open your browser and visit:
👉 **`http://localhost:8080`**

---

## 📂 Project Folder Structure (What is Where?)

Here is a simple map of where everything lives:

```plaintext
AI-Resume-Optimizer/
│
├── server.ts              # The backend Node/Express server and rate limiter
├── package.json           # List of dependencies and scripts
├── .env                   # Your private API keys (never share this!)
│
├── supabase/              # Database SQL scripts for login & history
│   └── migrations/
│
└── src/                   # Frontend source code
    ├── App.tsx            # Main page where you enter resume & job description
    ├── main.tsx           # Entry point that connects React to index.html
    │
    ├── components/        # Reusable UI parts
    │   ├── Navbar.tsx             # Top bar with rate limit badge & menu
    │   ├── ResumeInput.tsx        # Box where you upload or paste your resume
    │   ├── JobDescriptionInput.tsx# Box where you paste the job description
    │   ├── InitialScoreCard.tsx   # Card showing your ATS score & missing skills
    │   ├── ResultCard.tsx         # Card showing score boost & improvements
    │   └── ResumeDocumentView.tsx # The formatted resume preview & download buttons (.doc, .html, etc.)
    │
    ├── pages/             # Different screens of the website
    │   ├── DashboardPage.tsx      # Past analysis history for logged-in users
    │   ├── LoginPage.tsx          # Sign-in page
    │   ├── SignupPage.tsx         # Sign-up page
    │   └── ForgotPasswordPage.tsx # Password reset page
    │
    ├── services/          # Logic that talks to AI and database
    │   ├── geminiService.ts       # Sends requests to Google Gemini AI
    │   ├── promptBuilder.ts       # The exact instructions given to the AI
    │   ├── historyService.ts      # Saves and loads your scan history
    │   └── rateLimitService.ts    # Tracks how many scans you have remaining
    │
    └── utils/             # Helper tools
        ├── fileParser.ts          # Reads text from PDF and Word files
        └── resumeFormatter.ts     # Cleans up AI markdown into neat headings and bullets
```

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Do I have to pay to use this?**  
A: No! Google AI Studio provides a free tier for the Gemini API, and Supabase has a free tier for databases.

**Q: Can I upload a PDF resume?**  
A: Yes! You can drag-and-drop a PDF, Word document (`.docx` or `.doc`), or plain text file.

**Q: In what formats can I download the optimized resume?**  
A: You can download it as:
- **`.doc`**: Standard Microsoft Word document with clean margins and Calibri font.
- **`.html`**: Formatted web document.
- **`.md`**: Markdown format.
- **`.txt`**: Plain text format.

**Q: What is the scan limit?**  
A: To prevent spam, each user gets **30 scans every 15 minutes**. You can always see your remaining scans in the top-right corner of the website.

---

## 📜 License

This project is open-source under the **MIT License**. Feel free to learn from it, customize it, and use it for your own portfolio!