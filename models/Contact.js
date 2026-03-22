const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 200 },
    email: { type: String, required: true, maxlength: 200 },
    service: { type: String, maxlength: 100 },
    message: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
