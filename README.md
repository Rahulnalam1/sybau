# SYBAU - Software for Your Business Automation with Utilities

## Overview
SYBAU is an AI-powered note-taking web application that seamlessly converts meeting notes into actionable tasks. By integrating with popular task management platforms like Trello, GitHub, and Jira, SYBAU eliminates the manual effort required to track and assign action items.

## Features
- **AI-Powered Task Extraction:** Uses Google's Gemini AI to analyze meeting notes and generate structured tasks.
- **Seamless Integrations:** Automatically syncs tasks with Linear and Jira.
- **Real-Time Automation:** Instantly identifies action items, assigns owners, and sets deadlines from unstructured text.
- **User-Friendly Web Interface:** Built with Next.js and styled with Tailwind CSS for a clean and responsive experience.
- **Secure Backend:** Powered by Node.js and Supabase for authentication and data management.

## How It Works
1. **Input Meeting Notes** – Users can enter notes directly or upload a text file.
2. **AI Processing** – The system extracts tasks, assigns owners, and detects deadlines.
3. **Task Creation** – Tasks are automatically created in Trello, GitHub, or Jira.
4. **Sync & Track** – Users can manage tasks within their preferred platforms without switching tools.

## Tech Stack
- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Node.js, Supabase
- **AI & NLP:** Google's Gemini AI
- **Integrations:** Linear API, Jira API

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Rahulnalam1/sybau.git
   cd sybau
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables (create a `.env` file and configure API keys for Gemini, Trello, GitHub, and Jira).
4. Run the development server:
   ```sh
   npm run dev
   ```

## Contributing
We welcome contributions! Feel free to submit pull requests or open issues to suggest improvements.

## License
This project is licensed under the MIT License.

---

### Contributors
Aryan Bahl
Rahul Nalam 
Abhi Addagatla
Srijan Bijjam
