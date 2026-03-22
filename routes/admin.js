const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const Project = require('../models/Project');
const Folder = require('../models/Folder');
const SiteSettings = require('../models/SiteSettings');
const Contact = require('../models/Contact');
const Admin = require('../models/Admin');

// All admin routes require authentication
router.use(requireAuth);

// =====================
// PROJECTS CRUD
// =====================

// GET /api/admin/projects — list all projects (admin view, includes unpublished)
router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find().populate('folder').sort({ order: 1, createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/admin/projects — create project with thumbnail
router.post('/projects', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 20 }]), async (req, res) => {
    try {
        const { title, category, description, tags, client, year, published, folder } = req.body;

        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required.' });
        }

        if (!req.files || !req.files.thumbnail || !req.files.thumbnail[0]) {
            return res.status(400).json({ message: 'Thumbnail image is required.' });
        }

        const thumbnailResult = await uploadToCloudinary(req.files.thumbnail[0].buffer, 'thumbnails');

        const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags) : [];

        // Upload gallery images if provided
        const galleryImages = [];
        if (req.files.images && req.files.images.length > 0) {
            for (const file of req.files.images) {
                const result = await uploadToCloudinary(file.buffer, 'gallery');
                galleryImages.push(result);
            }
        }

        const project = await Project.create({
            title: title.substring(0, 200),
            category: category.substring(0, 50),
            description: (description || '').substring(0, 5000),
            tags: parsedTags.slice(0, 20),
            thumbnail: thumbnailResult,
            images: galleryImages,
            client: (client || '').substring(0, 100),
            year: (year || '').substring(0, 10),
            folder: folder || null,
            published: published !== 'false'
        });

        res.status(201).json(project);
    } catch (err) {
        console.error('Error creating project:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'A project with this title already exists.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/admin/projects/:id — update project details (optionally replace thumbnail)
router.put('/projects/:id', upload.single('thumbnail'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        const { title, category, description, tags, client, year, published, folder } = req.body;

        if (title) {
            project.title = title.substring(0, 200);
        }
        if (category) project.category = category.substring(0, 50);
        if (description !== undefined) project.description = description.substring(0, 5000);
        if (client !== undefined) project.client = client.substring(0, 100);
        if (year !== undefined) project.year = year.substring(0, 10);
        if (published !== undefined) project.published = published !== 'false';
        if (folder !== undefined) project.folder = folder || null;

        if (tags !== undefined) {
            const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
            project.tags = (parsedTags || []).slice(0, 20);
        }

        // Replace thumbnail if new one uploaded
        if (req.file) {
            if (project.thumbnail && project.thumbnail.publicId) {
                await deleteFromCloudinary(project.thumbnail.publicId);
            }
            project.thumbnail = await uploadToCloudinary(req.file.buffer, 'thumbnails');
        }

        await project.save();
        res.json(project);
    } catch (err) {
        console.error('Error updating project:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'A project with this title already exists.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/admin/projects/:id — delete project + cleanup Cloudinary
router.delete('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        // Delete thumbnail from Cloudinary
        if (project.thumbnail && project.thumbnail.publicId) {
            await deleteFromCloudinary(project.thumbnail.publicId);
        }

        // Delete all gallery images from Cloudinary
        for (const img of project.images) {
            if (img.publicId) {
                await deleteFromCloudinary(img.publicId);
            }
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted.' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// =====================
// PROJECT GALLERY IMAGES
// =====================

// POST /api/admin/projects/:id/images — add images to project gallery
router.post('/projects/:id/images', upload.array('images', 10), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded.' });
        }

        const uploaded = [];
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, 'gallery');
            uploaded.push(result);
        }

        project.images.push(...uploaded);
        await project.save();
        res.json(project);
    } catch (err) {
        console.error('Error uploading images:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/admin/projects/:id/images/:publicId — remove single gallery image
router.delete('/projects/:id/images/:publicId(*)', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        const publicId = req.params.publicId;
        const imageIndex = project.images.findIndex(img => img.publicId === publicId);

        if (imageIndex === -1) {
            return res.status(404).json({ message: 'Image not found.' });
        }

        await deleteFromCloudinary(publicId);
        project.images.splice(imageIndex, 1);
        await project.save();
        res.json(project);
    } catch (err) {
        console.error('Error deleting image:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// =====================
// FOLDERS CRUD
// =====================

// GET /api/admin/folders — list folders
router.get('/folders', async (req, res) => {
    try {
        const folders = await Folder.find().sort({ order: 1, createdAt: 1 });
        res.json(folders);
    } catch (err) {
        console.error('Error fetching folders:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/admin/folders — create folder (max 6)
router.post('/folders', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Folder name is required.' });

        const folder = await Folder.create({ name: name.substring(0, 80), visible: false });
        res.status(201).json(folder);
    } catch (err) {
        console.error('Error creating folder:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Folder already exists.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/admin/folders/:id — update folder
router.put('/folders/:id', async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) return res.status(404).json({ message: 'Folder not found.' });

        const { name, visible } = req.body;
        if (name !== undefined) folder.name = name.substring(0, 80);
        if (visible !== undefined) folder.visible = visible === true || visible === 'true';

        await folder.save();
        res.json(folder);
    } catch (err) {
        console.error('Error updating folder:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Folder name is already in use. Please choose another name.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/admin/folders/:id — delete folder and clear from projects
router.delete('/folders/:id', async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) return res.status(404).json({ message: 'Folder not found.' });

        if (folder.coverImage && folder.coverImage.publicId) {
            await deleteFromCloudinary(folder.coverImage.publicId);
        }

        // Unset folder from projects under this folder
        await Project.updateMany({ folder: folder._id }, { $set: { folder: null } });

        await Folder.findByIdAndDelete(folder._id);
        res.json({ message: 'Folder deleted.' });
    } catch (err) {
        console.error('Error deleting folder:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/admin/folders/:id/cover-image — upload or replace folder cover image
router.put('/folders/:id/cover-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image is required.' });

        const folder = await Folder.findById(req.params.id);
        if (!folder) return res.status(404).json({ message: 'Folder not found.' });

        if (folder.coverImage && folder.coverImage.publicId) {
            await deleteFromCloudinary(folder.coverImage.publicId);
        }

        folder.coverImage = await uploadToCloudinary(req.file.buffer, 'folders');
        await folder.save();
        res.json(folder);
    } catch (err) {
        console.error('Error uploading folder cover image:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// =====================
// SITE SETTINGS (Hero / About images)
// =====================

// GET /api/admin/settings — get current settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await SiteSettings.get();
        res.json(settings);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/admin/settings/hero-image — upload hero image
router.put('/settings/hero-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image is required.' });

        const settings = await SiteSettings.get();

        // Delete old image if exists
        if (settings.heroImage && settings.heroImage.publicId) {
            await deleteFromCloudinary(settings.heroImage.publicId);
        }

        settings.heroImage = await uploadToCloudinary(req.file.buffer, 'site');
        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error('Error uploading hero image:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/admin/settings/about-image — upload about image
router.put('/settings/about-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image is required.' });

        const settings = await SiteSettings.get();

        // Delete old image if exists
        if (settings.aboutImage && settings.aboutImage.publicId) {
            await deleteFromCloudinary(settings.aboutImage.publicId);
        }

        settings.aboutImage = await uploadToCloudinary(req.file.buffer, 'site');
        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error('Error uploading about image:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// =====================
// CONTACT MESSAGES
// =====================

// GET /api/admin/messages — list all contact messages
router.get('/messages', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/admin/messages/:id/read — mark message as read
router.put('/messages/:id/read', async (req, res) => {
    try {
        const msg = await Contact.findById(req.params.id);
        if (!msg) return res.status(404).json({ message: 'Message not found.' });
        msg.read = true;
        await msg.save();
        res.json(msg);
    } catch (err) {
        console.error('Error updating message:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/admin/messages/:id — delete a message
router.delete('/messages/:id', async (req, res) => {
    try {
        const msg = await Contact.findById(req.params.id);
        if (!msg) return res.status(404).json({ message: 'Message not found.' });
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted.' });
    } catch (err) {
        console.error('Error deleting message:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// =====================
// CHANGE PASSWORD
// =====================

// PUT /api/admin/change-password
router.put('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const admin = await Admin.findOne();
        if (!admin) return res.status(404).json({ message: 'Admin not found.' });

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

        admin.password = newPassword;
        await admin.save();
        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// =====================
// NOTIFICATION EMAIL
// =====================

// GET /api/admin/notification-email
router.get('/notification-email', async (req, res) => {
    try {
        const settings = await SiteSettings.get();
        res.json({
            email: settings.smtpUser || process.env.SMTP_USER || '',
            hasPassword: !!(settings.smtpPass || process.env.SMTP_PASS)
        });
    } catch (err) {
        console.error('Error fetching notification email:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/admin/notification-email
router.put('/notification-email', async (req, res) => {
    try {
        const { email, smtpPass } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });
        if (!smtpPass) return res.status(400).json({ message: 'Google App Password is required.' });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        const settings = await SiteSettings.get();
        settings.smtpUser = email.substring(0, 200);
        settings.smtpPass = smtpPass.replace(/\s/g, '').substring(0, 200);
        settings.notificationEmail = email.substring(0, 200);
        await settings.save();
        res.json({ message: 'Contact email updated.', email: settings.smtpUser });
    } catch (err) {
        console.error('Error updating notification email:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
