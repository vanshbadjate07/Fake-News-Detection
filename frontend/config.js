// Configuration for different environments
const CONFIG = {
    // For local development
    LOCAL_API_URL: 'http://127.0.0.1:8000',
    
    // For production deployment (update this with your deployed backend URL)
    PRODUCTION_API_URL: 'https://fake-news-detection-zxoh.onrender.com',
    
    // Auto-detect environment
    getApiUrl: function() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.LOCAL_API_URL;
        }
        return this.PRODUCTION_API_URL;
    }
};

// Export for use in other files
window.CONFIG = CONFIG;
