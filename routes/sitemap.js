const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET /sitemap.xml — dynamic sitemap
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({ published: true }).select('slug updatedAt').lean();

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static pages
        const staticPages = [
            { loc: '/', priority: '1.0', changefreq: 'weekly' },
            { loc: '/projects', priority: '0.8', changefreq: 'weekly' }
        ];

        for (const page of staticPages) {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        }

        // Dynamic project pages
        for (const project of projects) {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/project/${encodeURIComponent(project.slug)}</loc>\n`;
            xml += `    <lastmod>${new Date(project.updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        }

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap error:', err);
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;
