# NewZLM

NewzLM is a web-based AI assistant platform designed to empower journalists through collaborative intelligence by offering a smart, intuitive system for content research, analysis, and generation. 

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/silvermete0r/newzlm)

*21-22 June, 2025 |  Team: Yan LeCun Fan Club | Meta Llama IdeaThon 2025*

**Local Development**

**Installation:**

```sh
git clone https://github.com/silvermete0r/newzlm

cd newzlm
```

**Setup & Run Frontend:**

```sh
npm i

npm run dev
```

**Setup & Run FastAPI LLaMa API:**

```sh
cd fastapi-llama-api

python -m venv venv

pip install -r requirements.txt

source venv/bin/activate  # On Windows use `venv\Scripts\activate`

python app.py
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- FastAPI
- Python
- LLaMa 3 (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`)
- NewsAPI
- Groq API (fast inference with LLaMa 3)
- Google Translate API

## Credits

Build with [Lovable](https://lovable.dev/) & [Github Copilot](https://github.com/features/copilot)

