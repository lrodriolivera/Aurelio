// =========================================
// Script to generate password hash
// Usage: tsx src/scripts/generate-password-hash.ts <password>
// =========================================

import bcrypt from 'bcrypt';

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
