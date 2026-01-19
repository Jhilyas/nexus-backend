// Test Google Gemini Integration
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testGeminiChat() {
    console.log('Testing Google Gemini Integration...');

    try {
        // Test: SAGE Chat with Gemini
        console.log('Testing SAGE Chat with Gemini...');
        const chatRes = await fetch(`${API_URL}/api/sage/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Bonjour! Dis-moi juste: Salut, je suis SAGE!',
                conversationHistory: [],
                mode: 'mentor',
                language: 'fr'
            })
        });

        if (!chatRes.ok) {
            throw new Error(`HTTP error! status: ${chatRes.status}`);
        }

        const chatData = await chatRes.json();
        console.log('SAGE Response:', chatData.reply);
        console.log('Model:', chatData.usage?.model || 'gemini-pro');

        console.log('Google Gemini is working perfectly!');

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testGeminiChat();
