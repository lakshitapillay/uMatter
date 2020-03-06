const mongoose = require('mongoose');
const sdSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  mobileno: String,
  googleID: String,
  isMobVer: String,
  isMedicalDetailsEntered: Boolean,
  isMedDetEnt: Boolean,
  otp: String,
  userType: String,
  password: String,
  bookmarks: [{
    type: mongoose.Types.ObjectId,
    ref: 'article'
  }],
  profilePic: String
}, {
  timestamps: true
});

module.exports = mongoose.model('user', sdSchema);