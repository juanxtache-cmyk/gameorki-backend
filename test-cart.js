const http = require('http');

// Primero necesitamos un token de autenticación
// Para simplicidad, vamos a probar el endpoint sin auth (deberías obtener un token real)
const data = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/cart/clear',
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    // Agrega aquí tu token JWT si tienes uno:
    // 'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();