const { execSync } = require('child_process');

try {
  // Use the older Sony bravia REST API to turn it off, which often works without a PIN
  // Requesting power status first
  const status = execSync(`curl -s -X POST http://192.168.1.22/sony/system -H "Content-Type: application/json" -d '{"method":"getPowerStatus","version":"1.0","id":1,"params":[]}'`).toString();
  console.log('Status:', status);
} catch(e) {
  console.log('Error:', e.message);
}
