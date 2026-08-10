const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  officeId: { type: String, default: 'GMIDCHO', index: true },
  name: { type: String, default: '' },
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.password.startsWith('$2b$') && !this.password.startsWith('$2a$')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
