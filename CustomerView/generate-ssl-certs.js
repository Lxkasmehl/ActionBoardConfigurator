import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

const keyPath = path.resolve(process.cwd(), 'key.pem');
const certPath = path.resolve(process.cwd(), 'cert.pem');

// Check if certificates already exist and are recent (less than 7 days old)
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const keyStats = fs.statSync(keyPath);
  const certStats = fs.statSync(certPath);
  const now = new Date();
  const keyAge = now - keyStats.mtime;
  const certAge = now - certStats.mtime;

  // If certificates are less than 7 days old, reuse them
  if (keyAge < 7 * 24 * 60 * 60 * 1000 && certAge < 7 * 24 * 60 * 60 * 1000) {
    console.log('Recent SSL certificates found. Skipping generation.');
    process.exit(0);
  } else {
    console.log('SSL certificates are old. Regenerating...');
  }
}

console.log('Generating self-signed SSL certificates...');

try {
  // Generate private key and certificate with faster settings for testing
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 30 -nodes -subj "/C=DE/ST=State/L=City/O=Organization/CN=localhost"`,
    {
      stdio: 'inherit',
    },
  );

  console.log('SSL certificates generated successfully!');
  console.log('key.pem and cert.pem have been created in the project root.');
} catch (error) {
  console.error('Error generating SSL certificates:', error.message);
  console.log("\nIf you don't have OpenSSL installed, you can:");
  console.log('1. Install OpenSSL: https://www.openssl.org/');
  console.log('2. Or manually create key.pem and cert.pem files');
  console.log('3. Or modify vite.config.js to use HTTP instead of HTTPS');
  process.exit(1);
}
