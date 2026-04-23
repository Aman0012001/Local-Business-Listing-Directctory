
const http = require('http');

http.get('http://localhost:3001/api/v1/offers/public/search?limit=4&placement=homepage', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('API Titles:', json.data.map(o => o.title));
  });
});
