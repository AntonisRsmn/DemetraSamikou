const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    heroImage: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
    },
    aboutImage: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
    },
    notificationEmail: {
        type: String,
        default: ''
    },
    smtpUser: {
        type: String,
        default: ''
    },
    smtpPass: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Ensure only one settings document exists
siteSettingsSchema.statics.get = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;
