const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const actionId = '99e94ec8252379eb80ac91dc9375bf9e17c2a1b3';
const body = `--${boundary}\r\nContent-Disposition: form-data; name="1_$ACTION_ID_${actionId}"\r\n\r\n\r\n--${boundary}\r\nContent-Disposition: form-data; name="0"\r\n\r\n[]\r\n--${boundary}--`;

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/login',
  method: 'POST',
  headers: {
    'Accept': 'text/x-component',
    'Next-Action': actionId,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
});
req.end(body);
