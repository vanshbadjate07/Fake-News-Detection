document.addEventListener('DOMContentLoaded', () => {
    const newsInput = document.getElementById('news-input');
    const verifyBtn = document.getElementById('verify-btn');
    const clearBtn = document.getElementById('clear-btn');
    const loadingArea = document.getElementById('loading-area');
    const resultsArea = document.getElementById('results-area');
    const exampleBtns = document.querySelectorAll('.example-btn');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    let currentStep = 0;
    const steps = document.querySelectorAll('.step');
    let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');

    // Example button functionality
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const exampleText = btn.getAttribute('data-text');
            newsInput.value = exampleText;
            newsInput.focus();
            
            // Add visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Clear button functionality
    clearBtn.addEventListener('click', () => {
        newsInput.value = '';
        hideResults();
        newsInput.focus();
    });

    // History functionality
    clearHistoryBtn.addEventListener('click', () => {
        analysisHistory = [];
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
        updateHistoryDisplay();
        showNotification('History cleared successfully', 'info');
    });

    function addToHistory(text, result) {
        const historyItem = {
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            result: result,
            timestamp: new Date().toLocaleString()
        };
        
        analysisHistory.unshift(historyItem);
        if (analysisHistory.length > 10) {
            analysisHistory = analysisHistory.slice(0, 10);
        }
        
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        if (analysisHistory.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = analysisHistory.map(item => `
            <div class="history-item" onclick="loadHistoryItem('${item.text.replace(/'/g, "\\'")}')">
                <div class="history-text">${item.text}</div>
                <div class="history-result">${item.result} • ${item.timestamp}</div>
            </div>
        `).join('');
    }

    window.loadHistoryItem = function(text) {
        newsInput.value = text.replace(/\.\.\.$/, '');
        newsInput.focus();
        showNotification('Text loaded from history', 'info');
    };

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'info' ? 'info-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Initialize history display
    updateHistoryDisplay();

    // Enter key to submit
    newsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            verifyBtn.click();
        }
    });

    verifyBtn.addEventListener('click', async () => {
        const inputText = newsInput.value.trim();
        if (!inputText) {
            showNotification('Please enter news text or a URL to analyze.', 'warning');
            return;
        }

        showLoading();
        startLoadingAnimation();

        try {
            const response = await fetch(`${CONFIG.getApiUrl()}/api/analyze/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            hideLoading();
            displayResult(result);
            
            // Add to history
            addToHistory(inputText, result.status);

        } catch (error) {
            console.error('Error:', error);
            hideLoading();
            showError('Failed to analyze the content. Please check your connection and try again.');
        }
    });

    function showLoading() {
        loadingArea.classList.remove('hidden');
        resultsArea.classList.add('hidden');
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Analyzing...</span>';
    }

    function hideLoading() {
        loadingArea.classList.add('hidden');
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Analyze Now</span>';
        resetLoadingAnimation();
    }

    function hideResults() {
        resultsArea.classList.add('hidden');
        loadingArea.classList.add('hidden');
    }

    function startLoadingAnimation() {
        // Simplified - no step animation needed
    }

    function resetLoadingAnimation() {
        // Simplified - no step animation needed
    }

    function displayResult(result) {
        resultsArea.classList.remove('hidden');
        resultsArea.innerHTML = '';

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');

        // Determine result class
        if (result.status.includes('❌')) {
            resultDiv.classList.add('fake');
        } else if (result.status.includes('✅')) {
            resultDiv.classList.add('real');
        } else {
            resultDiv.classList.add('unverified');
        }

        // Create result content
        const statusHTML = `<h2>${result.status}</h2>`;
        const confidenceHTML = `<div class="confidence">Confidence Score: ${Math.round(result.confidence * 100)}%</div>`;
        const summaryHTML = `<div class="summary">${result.summary}</div>`;
        
        let sourcesHTML = '';
        if (result.sources && result.sources.length > 0) {
            sourcesHTML = '<div class="sources"><h3><i class="fas fa-link"></i> Verified Sources:</h3><ul>';
            result.sources.forEach(source => {
                if (source.url) {
                    sourcesHTML += `<li><a href="${source.url}" target="_blank" rel="noopener">${source.title}</a></li>`;
                } else {
                    sourcesHTML += `<li>${source.title}</li>`;
                }
            });
            sourcesHTML += '</ul></div>';
        }

        resultDiv.innerHTML = statusHTML + confidenceHTML + summaryHTML + sourcesHTML;
        resultsArea.appendChild(resultDiv);

        // Smooth scroll to results
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showError(message) {
        resultsArea.classList.remove('hidden');
        resultsArea.innerHTML = `
            <div class="result fake">
                <h2><i class="fas fa-exclamation-triangle"></i> Error</h2>
                <div class="summary">${message}</div>
            </div>
        `;
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});
