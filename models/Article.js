const mongoose = require('mongoose')
const sdSchema = new mongoose.Schema({
    username: String,
    title: String,
    text: String,
    topicType: String,
    googleID: String,
    catering: String,
    reportNo: Number,
    hidden: Boolean,
    score: Number,
    userID: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('article', sdSchema);