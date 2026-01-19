// Direct test of Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA9YrD_41A1vU8bzmVfmRhl-Jff7S-v3ck';

async function testDirect() {
    console.log('Testing Gemini API directly...');

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Try different models
        const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro'];

        for (const modelName of models) {
            console.log(`\nTrying model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say hello in French');
                console.log(`SUCCESS with ${modelName}:`, result.response.text());
                break;
            } catch (e) {
                console.log(`Failed with ${modelName}:`, e.message.substring(0, 100));
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testDirect();
