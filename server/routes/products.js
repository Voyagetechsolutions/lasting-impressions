import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product (protected)
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, originalPrice, original_price, category, material, color, size, quantity, stock, inStock, in_stock } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const { data, error } = await supabase
            .from('products')
            .insert({
                name,
                description,
                price: parseFloat(price),
                original_price: (originalPrice || original_price) ? parseFloat(originalPrice || original_price) : null,
                category,
                material,
                color,
                size,
                quantity,
                stock: parseInt(stock) || 0,
                in_stock: (inStock !== undefined ? (inStock === 'true' || inStock === true) : (in_stock === 'true' || in_stock === true)),
                images
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product (protected)
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Get new uploaded images
        const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // Combine with existing images if provided
        let allImages = [];
        if (updates.existingImages) {
            try {
                allImages = JSON.parse(updates.existingImages);
            } catch (e) {
                allImages = Array.isArray(updates.existingImages) ? updates.existingImages : [updates.existingImages];
            }
        }
        allImages = [...allImages, ...newImages];

        if (allImages.length > 0) {
            updates.images = allImages;
        }

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete product (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
