const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Folder = require('../models/Folder');
const SiteSettings = require('../models/SiteSettings');

const DEFAULT_FOLDER_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23F2E5C6"/><circle cx="300" cy="170" r="70" fill="%23E2B3C2"/><rect x="140" y="280" width="320" height="14" rx="7" fill="%23AC5B67" opacity="0.45"/></svg>';

// GET /api/projects — paginated list of published projects
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 30));
        const category = req.query.category;
        const skip = (page - 1) * limit;

        const folder = req.query.folder;
        const query = { published: true };
        if (category && category !== 'all') {
            query.category = { $eq: category };
        }
        if (folder && folder !== 'all') {
            query.folder = folder;
        }

        const [projects, total] = await Promise.all([
            Project.find(query).populate('folder').sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
            Project.countDocuments(query)
        ]);

        res.json({
            projects,
            total,
            page,
            pages: Math.ceil(total / limit),
            hasMore: skip + projects.length < total
        });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/projects/categories/list — distinct categories (optionally filtered by folder)
router.get('/categories/list', async (req, res) => {
    try {
        const filter = { published: true };
        if (req.query.folder && req.query.folder !== 'all') {
            filter.folder = req.query.folder;
        }
        const categories = await Project.distinct('category', filter);
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/settings — public site settings (hero/about images)
router.get('/site/settings', async (req, res) => {
    try {
        const settings = await SiteSettings.get();
        res.json({
            heroImage: settings.heroImage,
            aboutImage: settings.aboutImage,
            socialLinks: (settings.socialLinks || []).filter(l => l.enabled && l.url)
        });
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/projects/folders/featured — visible folders for homepage cards
router.get('/folders/featured', async (req, res) => {
    try {
        const folders = await Folder.find({ visible: true }).sort({ order: 1, name: 1 });

        const payload = await Promise.all(folders.map(async (folder) => {
            const firstProject = await Project.findOne({ folder: folder._id, published: true }).sort({ order: 1, createdAt: -1 });
            const image = (folder.coverImage && folder.coverImage.url)
                ? folder.coverImage.url
                : (firstProject && firstProject.thumbnail && firstProject.thumbnail.url)
                    ? firstProject.thumbnail.url
                    : DEFAULT_FOLDER_IMAGE;

            return {
                _id: folder._id,
                name: folder.name,
                slug: folder.slug,
                image,
                projectCount: await Project.countDocuments({ folder: folder._id, published: true }),
            };
        }));

        res.json(payload);
    } catch (err) {
        console.error('Error fetching featured folders:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/folders — visible folders for website
router.get('/folders', async (req, res) => {
    try {
        const folders = await Folder.find({ visible: true }).sort({ order: 1, name: 1 });
        res.json(folders);
    } catch (err) {
        console.error('Error fetching folders:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/projects/:slug — single project by slug
router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const project = await Project.findOne({ slug: { $eq: slug }, published: true });
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json(project);
    } catch (err) {
        console.error('Error fetching project:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
