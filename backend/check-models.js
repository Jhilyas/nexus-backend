const apiKey = 'AIzaSyASzdjr3-ATwjBXh_VTc-E73w-UkO3OvEw';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function testKey() {
    try {
        console.log('Testing API Key...');
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error);
        } else {
            console.log('Available Models:');
            // Filter for generateContent supported models
            const models = data.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name);

            console.log('--- MODELS START ---');
            models.forEach(m => console.log(m));
            console.log('--- MODELS END ---');
        }

        // Try a simple generation with gemini-pro as a test
        console.log('\nTesting Generation with gemini-2.0-flash-exp (if avaiable) or gemini-pro...');
        // We'll just test the list for now to pick the right one.

    } catch (error) {
        console.error('Network Error:', error);
    }
}

testKey();
