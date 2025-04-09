const bcrypt = require('bcrypt');

const plainPassword = 'password123';
const hashedPasswordFromDB =
  '$2b$10$SUwMlcVqJQi5bl.Ybz7JZ.ncdran9jOu1TZDGQRMPzBNirvfG7X6q';

// Generate a new hash for the same plain password
const newHashedPassword = bcrypt.hashSync(plainPassword, 10);
console.log('Newly Generated Hashed Password:', newHashedPassword);

// Compare the plain password with the hash from the database
const isMatch = bcrypt.compareSync(plainPassword, hashedPasswordFromDB);
console.log('Password Match with DB Hash:', isMatch);

// Compare the plain password with the newly generated hash
const isMatchWithNewHash = bcrypt.compareSync(plainPassword, newHashedPassword);
console.log('Password Match with New Hash:', isMatchWithNewHash);
