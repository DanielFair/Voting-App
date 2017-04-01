const mongoose = require('mongoose');

let loginschema = new mongoose.Schema({
    name: String,
    someID: String
});

let User = mongoose.model('User', loginschema);

module.exports = User;