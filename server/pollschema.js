const mongoose = require('mongoose');

let pollSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    options: { type: Array, required: true },
    votecounts: { type: Object, required: true },
    voted: { type: Array },
    author: { type: String }
}, { collection: 'allPolls' });

let Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;