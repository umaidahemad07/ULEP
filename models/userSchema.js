const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true }, 
    email: { type: String, required: true, unique: true, trim: true },    
    collegeName: { type: String, required: true },
    branch: { type: String, required: true },
    currentYear: { type: String, required: true },
    password: { type: String, required: true },
    about: {type: String, default:"new user"}
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);