# 🎬 AI Video Search Tool

A multimodal video analysis tool that lets you "watch" a video with AI. Upload a lecture, meeting, or webinar, and use Google's Gemini 2.5 Flash to ask questions about **what was said** (audio) AND **what was shown** (visuals).

## 🌟 Key Features

* **Multimodal Search:** The AI analyzes both the audio track and the visual frames. You can ask *"When did the graph appear?"* or *"When did he say 'deadline'?"*.
* **Smart Auto-Play:** The tool parses the timestamp from the AI's answer and automatically jumps the video player to that exact moment (minus 10 seconds for context).
* **Gemini 2.5 Flash:** Uses the latest Long Context model to handle large video files efficiently.
* **Local Playback:** Keeps the video file locally so you can watch the clips instantly in your browser.

## 🛠️ Tech Stack

* **Backend:** Python (Flask)
* **AI Model:** Google Gemini 2.5 Flash (via `google-genai` SDK)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Player Logic:** HTML5 Video API with Regex parsing for timestamps.

## 📦 Installation

1.  **Navigate to the project folder:**
    ```bash
    cd "/Users/johnzhang/Downloads/AI webapp4"
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure API Key:**
    Create a `.env` file in this folder and add your key:
    ```ini
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```

## 🏃‍♂️ How to Run

### Method 1: Standalone
Run the app specifically on **Port 5003**:
```bash
python3 app.py
