// =========================================
// Password Hash Generator
// Use this to generate a bcrypt hash for the admin password
// =========================================

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('🔐 Password Hash Generator');
console.log('========================================\n');

rl.question('Enter the password you want to hash: ', (password) => {
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    rl.close();
    process.exit(1);
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('❌ Error generating hash:', err);
      rl.close();
      process.exit(1);
    }

    console.log('\n✅ Password hash generated successfully!\n');
    console.log('Copy this hash and use it in your database:');
    console.log('─'.repeat(80));
    console.log(hash);
    console.log('─'.repeat(80));
    console.log('\nTo update admin password in Railway:');
    console.log('1. Open Railway Shell for your PostgreSQL database');
    console.log('2. Run this SQL command:\n');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@transport.com';`);
    console.log('\n');

    rl.close();
  });
});

rl.on('close', () => {
  process.exit(0);
});
