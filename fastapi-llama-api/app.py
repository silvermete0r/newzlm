import re
import requests
from fastapi import FastAPI, HTTPException
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

@app.get("/generate_article")
def generate_article(system_prompt: str, url: str) -> dict:
    try:
        fulltitle = get_title_from_url(url)
        article_title= generate_title_llama3(fulltitle)
        article_text = generate_article_llama3(system_prompt, url)
        return {"title": article_title, "content": article_text}
    except Exception:
        return {"title": "The Steppe", "content": "The Steppe is a vast, treeless plain, characterized by its grassland ecosystem and often found in regions with a continental climate. It is known for its unique flora and fauna, as well as its historical significance as a habitat for nomadic cultures."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def read_article(url: str) -> str:
    try:
        if 'youtube.com/watch' in url or 'youtu.be/' in url:
            return transcribe_youtube(url)
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('title').get_text(strip=True)
        header = soup.find('h1').get_text(strip=True) if soup.find('h1') else title
        paragraphs = [p.get_text(strip=True) for p in soup.find_all('p')]
        article_content = ' '.join(paragraphs)
        article_text = f"{header}\n\n{article_content}"
        return article_text
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_title_from_url(url: str) -> str:
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('title').get_text(strip=True)
        return title
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

def transcribe_youtube(url: str) -> str:
    video_id = url.split('v=')[-1].split('&')[0]
    if 'youtu.be/' in url:
        video_id = url.split('youtu.be/')[-1].split('?')[0]
    elif 'v=' in url:
        video_id = url.split('v=')[-1].split('&')[0]
    else:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    print(video_id)
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    transcript_text = ' '.join([item['text'] for item in transcript])
    return transcript_text
    
def generate_title_llama3(fulltitle: str) -> str:
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
        {
            "role": "user",
            "content":  f"Return creative title, no more than 30 words for the following article: {fulltitle}. Without any special characters, only letters and numbers. Do not use any quotes or special characters in the title."
        }
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )
    
    generated_title = completion.choices[0].message.content.strip()

    return generated_title

def generate_article_llama3(system_prompt: str, url: str) -> str:
    article_text = read_article(url)

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": f"You are professional Media AI Assistant Article Writer - Write an article according to this setup {system_prompt} based on the following article: {article_text}. Without any special characters, only letters and numbers. Do not use any quotes or special characters."
            }
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )

    generated_content = completion.choices[0].message.content.strip()

    return generated_content
    
def test_generate_article_llama3():
    system_prompt = """
Write an article using an [informative/optimistic/empathetic/pop-sci] tone. Structure: intro (relevance), body (story, goals, tech, funding), conclusion (impact, future, optional CTA). Style: [pop-sci magazine/news site], with expert quotes, stories, links. Be neutral, empathetic, authoritative, and clear. Use conditional phrasing, avoid absolutes. Respect ethics and context. Audience: general readers interested in tech and creative fields in Central Asia. Only use allowed sources with links.    
"""
    try:
        print(generate_article_llama3(system_prompt, "https://www.space.com/astronomy/black-holes/nobel-laureate-concerned-about-ai-generated-image-of-black-hole-at-the-center-of-our-galaxy"))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # test_generate_article_llama3()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)