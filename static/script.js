const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('video-file');
const loadingText = document.getElementById('loading');
const searchSection = document.getElementById('search-section');
const videoPlayer = document.getElementById('main-player');
const playerContainer = document.getElementById('player-container');
const feedbackText = document.getElementById('timestamp-feedback');

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) await uploadFile(file);
});

async function uploadFile(file) {
    loadingText.classList.remove('hidden');
    loadingText.textContent = `Processing ${file.name}... (Don't close this tab)`;
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadingText.textContent = "Video Indexed!";
            searchSection.classList.remove('hidden');
            dropZone.style.borderColor = "#8ab4f8";
            
            // Set the video source to the local file we just uploaded
            videoPlayer.src = `/static/${data.filename}`;
            videoPlayer.load(); // Prepare the video
        } else {
            loadingText.textContent = "Error: " + data.error;
        }
    } catch (error) {
        loadingText.textContent = "Upload failed.";
        console.error(error);
    }
}

async function searchVideo() {
    const query = document.getElementById('query-input').value;
    const resultsArea = document.getElementById('results-area');
    
    if (!query) return;

    resultsArea.innerHTML = '<p style="color:#9aa0a6;">Scanning video content...</p>';
    playerContainer.classList.add('hidden'); // Hide player while searching

    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        
        const data = await response.json();
        
        if (data.result) {
            // 1. Display Text Result
            let formattedText = data.result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            resultsArea.innerHTML = `<div class="result-card">${formattedText}</div>`;

            // 2. Parse Timestamp for Auto-Play
            // Regex looks for "TIMESTAMP: [MM:SS]" or just "[MM:SS]"
            const timeMatch = data.result.match(/\[(\d+):(\d+)\]/);
            
            if (timeMatch) {
                const minutes = parseInt(timeMatch[1]);
                const seconds = parseInt(timeMatch[2]);
                let totalSeconds = (minutes * 60) + seconds;
                
                // Rewind 10 seconds (but don't go below 0)
                let jumpTime = Math.max(0, totalSeconds - 10);

                // Show and Play Video
                playerContainer.classList.remove('hidden');
                videoPlayer.currentTime = jumpTime;
                
                // Play automatically
                videoPlayer.play().catch(e => console.log("Auto-play prevented by browser policy"));
                
                feedbackText.textContent = `Found at ${minutes}:${seconds < 10 ? '0'+seconds : seconds}. Playing from -10s context...`;
            }

        } else {
            resultsArea.innerHTML = `<div class="result-card" style="border-color:red;">Error: ${data.error}</div>`;
        }

    } catch (error) {
        resultsArea.innerHTML = "Error connecting to server.";
    }
}