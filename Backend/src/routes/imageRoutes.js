const express = require('express');
const fs = require('fs');
const path = require('path');
const Image = require('../models/Image');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../services/uploadService');

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Image file is required' });

        const imageUrl = req.file.path;
        const newImage = new Image({ name, description, imageUrl, userId: req.user.id });
        await newImage.save();
        res.status(201).json(newImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const images = await Image.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image || image.userId.toString() !== req.user.id)
            return res.status(404).json({ message: 'Image not found' });

        const filePath = path.join('uploads', path.basename(image.imageUrl));
        fs.unlink(filePath, err => err && console.error('Error deleting file:', err));
        await image.deleteOne();
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
