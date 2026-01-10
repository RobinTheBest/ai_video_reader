import os
import time
from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure Gemini
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
MODEL_ID = "gemini-2.5-flash"

UPLOADED_FILES = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Save locally in static folder (REQUIRED for playback)
        temp_path = os.path.join("static", file.filename)
        file.save(temp_path)

        try:
            print(f"Uploading {file.filename} to Gemini...")
            
            # Upload to Gemini File API
            remote_file = client.files.upload(file=temp_path, config={'display_name': file.filename})
            
            # Wait for processing
            print("Processing video...")
            while remote_file.state.name == "PROCESSING":
                time.sleep(5)
                remote_file = client.files.get(name=remote_file.name)

            if remote_file.state.name == "FAILED":
                raise ValueError("Video processing failed on Google's side.")

            UPLOADED_FILES['current_video'] = remote_file
            
            # CRITICAL CHANGE: We do NOT delete the file anymore.
            # The browser needs it to play the clip.
            # os.remove(temp_path) <--- Commented out

            return jsonify({
                "message": "Video processed! Ready for questions.", 
                "filename": file.filename 
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['POST'])
def search_video():
    data = request.json
    query = data.get('query')
    
    remote_file = UPLOADED_FILES.get('current_video')
    if not remote_file:
        return jsonify({"error": "No video uploaded yet."}), 400

    try:
        # Prompt engineered to force a standard timestamp format we can parse with Regex
        prompt = f"""
        You are an expert video analyst. 
        User Question: "{query}"

        Analyze the video (visuals and audio) to find the answer.
        
        CRITICAL: Start your response with the timestamp in this EXACT format:
        TIMESTAMP: [MM:SS]

        Then provide the rest of the details:
        VISUAL: [Description]
        AUDIO: [Summary]
        ANSWER: [Direct Answer]
        """

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[remote_file, prompt]
        )

        return jsonify({"result": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('static'):
        os.makedirs('static')
    app.run(debug=True, port=5003)