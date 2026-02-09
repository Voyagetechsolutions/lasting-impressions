import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from '../db.js';
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
        const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const products = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product (protected)
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, originalPrice, category, material, color, size, quantity, stock, inStock } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const newProduct = await sql`
      INSERT INTO products (name, description, price, original_price, category, material, color, size, quantity, stock, in_stock, images)
      VALUES (
        ${name},
        ${description || null},
        ${parseFloat(price)},
        ${originalPrice ? parseFloat(originalPrice) : null},
        ${category || null},
        ${material || null},
        ${color || null},
        ${size || null},
        ${quantity || null},
        ${parseInt(stock) || 0},
        ${inStock === 'true' || inStock === true},
        ${images}
      )
      RETURNING *
    `;

        res.status(201).json(newProduct[0]);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product (protected)
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, originalPrice, category, material, color, size, quantity, stock, inStock, existingImages } = req.body;

        // Get new uploaded images
        const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // Combine with existing images if provided
        let allImages = [];
        if (existingImages) {
            try {
                allImages = JSON.parse(existingImages);
            } catch (e) {
                allImages = Array.isArray(existingImages) ? existingImages : [existingImages];
            }
        }
        allImages = [...allImages, ...newImages];

        const updated = await sql`
      UPDATE products
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          price = COALESCE(${price ? parseFloat(price) : null}, price),
          original_price = ${originalPrice ? parseFloat(originalPrice) : null},
          category = COALESCE(${category}, category),
          material = COALESCE(${material}, material),
          color = COALESCE(${color}, color),
          size = COALESCE(${size}, size),
          quantity = COALESCE(${quantity}, quantity),
          stock = COALESCE(${stock ? parseInt(stock) : null}, stock),
          in_stock = COALESCE(${inStock !== undefined ? (inStock === 'true' || inStock === true) : null}, in_stock),
          images = ${allImages.length > 0 ? allImages : null},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        if (updated.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(updated[0]);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete product (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;

        if (deleted.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
