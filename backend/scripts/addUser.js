// filepath: d:\visitorpass\backend\scripts\addUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const addUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/visitorpass', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const username = 'admin'; // Replace with desired username
    const plainPassword = 'password123'; // Replace with desired password
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    console.log(hashedPassword);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    console.log('User added successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding user:', error);
    mongoose.connection.close();
  }
};

addUser();
