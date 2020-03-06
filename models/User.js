const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: String,
  googleID: String,
  date: {
    type: Date,
    default: Date.now
  },
  image: String,
  username: String
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
