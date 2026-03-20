const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    coverImage: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' },
    },
    visible: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

folderSchema.pre('validate', async function(next) {
    try {
        if (!this.isModified('name') && this.slug) return next();

        const baseSlug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || 'folder';

        let candidate = baseSlug;
        let counter = 2;

        while (true) {
            const existing = await this.constructor.findOne({
                slug: candidate,
                _id: { $ne: this._id }
            }).lean();

            if (!existing) break;
            candidate = `${baseSlug}-${counter}`;
            counter += 1;
        }

        this.slug = candidate;
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Folder', folderSchema);
