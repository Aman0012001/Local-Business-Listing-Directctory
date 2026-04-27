const fs = require('fs');
const http = require('http');

const url = 'http://localhost:3001/docs-json';
const targetFile = 'docs/swagger-collection.json';

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const formatted = JSON.stringify(json, null, 2);
            fs.writeFileSync(targetFile, formatted);
            console.log('Successfully updated ' + targetFile);
        } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            process.exit(1);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching Swagger JSON:', err.message);
    process.exit(1);
});
