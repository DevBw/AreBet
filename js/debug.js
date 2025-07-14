// Debug script for BetHelper
console.log('Debug script loaded');

// Test API key
const apiKey = '34217e3a7aa4a6e0acf7dfc67a7c726a';
console.log('API Key:', apiKey);

// Test API call
async function testAPICall() {
    try {
        console.log('Testing API call...');
        const response = await fetch('https://v3.football.api-sports.io/fixtures?date=2024-01-15', {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.response && data.response.length > 0) {
            console.log('Found matches:', data.response.length);
            return data;
        } else {
            console.log('No matches found for today');
            return null;
        }
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, testing API...');
    testAPICall();
});

// Export for use in main app
window.debugAPI = testAPICall; 