const fs = require('fs');

const apiKey = 'AIzaSyASzdjr3-ATwjBXh_VTc-E73w-UkO3OvEw';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function checkModels() {
    try {
        console.log('Fetching models...');
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            fs.writeFileSync('models.txt', `Error: ${JSON.stringify(data.error, null, 2)}`);
            return;
        }

        const modelNames = data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name);

        fs.writeFileSync('models.txt', modelNames.join('\n'));
        console.log('Models written to models.txt');

    } catch (error) {
        fs.writeFileSync('models.txt', `Network Error: ${error.message}`);
    }
}

checkModels();
