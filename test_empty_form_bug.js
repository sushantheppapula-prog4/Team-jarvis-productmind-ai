const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const body = `--${boundary}\r\nContent-Disposition: form-data; name="dummy"\r\n\r\n1\r\n--${boundary}--`;

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(body),
    'Next-Action': '99e94ec8252379eb80ac91dc9375bf9e17c2a1b3',
    'Accept': 'text/x-component'
  }
}, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', chunk => {
    console.log(`BODY: ${chunk}`);
  });
});

req.end(body);
