const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: ''
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    thumbnail: {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    }],
    client: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ''
    },
    year: {
        type: String,
        trim: true,
        maxlength: 10,
        default: ''
    },
    published: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    }
}, { timestamps: true });

// Auto-generate slug from title
projectSchema.pre('validate', async function() {
    if (this.isModified('title')) {
        let base = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Fallback for non-Latin titles (e.g. Greek)
        if (!base) {
            base = 'project-' + Date.now();
        }

        // Collision-safe: append -2, -3, etc. if slug already exists
        let slug = base;
        let counter = 1;
        const Model = this.constructor;
        while (true) {
            const existing = await Model.findOne({ slug, _id: { $ne: this._id } });
            if (!existing) break;
            counter++;
            slug = base + '-' + counter;
        }
        this.slug = slug;
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
