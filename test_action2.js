const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/login',
  method: 'POST',
  headers: {
    'Accept': 'text/x-component',
    'Next-Action': '99e94ec8252379eb80ac91dc9375bf9e17c2a1b3',
    'Content-Type': 'text/plain;charset=UTF-8',
    'Content-Length': 0
  }
}, res => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', chunk => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', e => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
