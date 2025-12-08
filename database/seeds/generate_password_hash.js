// Generate bcrypt hash for password
// Run: node database/seeds/generate_password_hash.js

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2] || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n✅ Password hash generated:');
  console.log('─'.repeat(60));
  console.log(`Password: ${password}`);
  console.log(`Hash:     ${hash}`);
  console.log('─'.repeat(60));
  console.log('\n📋 Copy the hash above and use it in insert_admin_user.sql\n');
}

generateHash().catch(console.error);

