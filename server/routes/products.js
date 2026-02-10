import express from 'express';
import multer from 'multer';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

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

        // Upload images to Supabase Storage
        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrl);
            }
        }

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
                images: imageUrls
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

        // Upload new images to Supabase Storage
        const newImageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);

                newImageUrls.push(publicUrl);
            }
        }

        // Combine with existing images if provided
        let allImages = [];
        if (updates.existingImages) {
            try {
                allImages = JSON.parse(updates.existingImages);
            } catch (e) {
                allImages = Array.isArray(updates.existingImages) ? updates.existingImages : [updates.existingImages];
            }
        }
        allImages = [...allImages, ...newImageUrls];

        if (allImages.length > 0) {
            updates.images = allImages;
        }

        delete updates.existingImages;

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
