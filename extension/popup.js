document.addEventListener('DOMContentLoaded', async () => {
    const textInput = document.getElementById('textInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    
    const verdictTitle = document.getElementById('verdictTitle');
    const verdictDesc = document.getElementById('verdictDesc');
    const scoreText = document.getElementById('scoreText');
    const scoreCircle = document.getElementById('scoreCircle');
    const signalsContainer = document.getElementById('signalsContainer');

    // Attempt to extract highlighted text from active tab
    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && !tab.url.startsWith('chrome://')) {
            let result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.getSelection().toString()
            });
            if (result && result[0] && result[0].result) {
                textInput.value = result[0].result;
            }
        }
    } catch (err) {
        console.error("Could not extract text: ", err);
    }

    verifyBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please highlight or paste some text first.');
            return;
        }

        // UI Loading State
        verifyBtn.disabled = true;
        results.style.display = 'none';
        loading.style.display = 'flex';

        try {
            // Call local TrueVerse API
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, model: 'auto' })
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);

            // Populate Results
            loading.style.display = 'none';
            results.style.display = 'flex';

            const v = data.verdict;
            const score = data.credibility_score_0_100 || 0;
            
            verdictTitle.textContent = v.title;
            verdictDesc.textContent = v.description;
            scoreText.textContent = score;
            
            // Set colors based on verdict key
            let colorHex = '#3b82f6'; // blue-500
            if (v.key === 'fake') colorHex = '#f43f5e'; // rose-500
            else if (v.key === 'misleading') colorHex = '#f59e0b'; // amber-500
            else if (v.key === 'partially_true') colorHex = '#facc15'; // yellow-400
            else if (v.key === 'reliable') colorHex = '#10b981'; // emerald-500

            verdictTitle.style.color = colorHex;
            scoreCircle.style.color = colorHex;
            
            // Force reflow to restart animation
            scoreCircle.style.transition = 'none';
            scoreCircle.setAttribute('stroke-dasharray', `0, 100`);
            setTimeout(() => {
                scoreCircle.style.transition = 'stroke-dasharray 1s ease-out';
                scoreCircle.setAttribute('stroke-dasharray', `${score}, 100`);
            }, 50);

            // Signals
            signalsContainer.innerHTML = '';
            const highlights = data.highlight_terms || [];
            if (highlights.length > 0) {
                signalsContainer.style.display = 'flex';
                highlights.slice(0, 5).forEach(term => {
                    const span = document.createElement('span');
                    span.className = 'signal-badge';
                    span.textContent = term;
                    signalsContainer.appendChild(span);
                });
            } else {
                signalsContainer.style.display = 'none';
            }

        } catch (err) {
            loading.style.display = 'none';
            alert("Failed to connect to TrueVerse backend. Is the server running at http://127.0.0.1:8000 ?");
        } finally {
            verifyBtn.disabled = false;
        }
    });
});
