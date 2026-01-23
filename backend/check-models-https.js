const https = require('https');
const fs = require('fs');

const apiKey = 'AIzaSyASzdjr3-ATwjBXh_VTc-E73w-UkO3OvEw';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                fs.writeFileSync('models.txt', `Error: ${JSON.stringify(json.error, null, 2)}`);
            } else {
                const names = json.models
                    .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name);
                fs.writeFileSync('models.txt', names.join('\n'));
            }
        } catch (e) {
            fs.writeFileSync('models.txt', `Parse Error: ${e.message}`);
        }
    });

}).on('error', (err) => {
    fs.writeFileSync('models.txt', `Network Error: ${err.message}`);
});
