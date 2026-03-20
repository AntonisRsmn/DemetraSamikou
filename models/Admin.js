const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: 100
    },
    password: {
        type: String,
        required: true
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
