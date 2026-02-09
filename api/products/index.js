import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    case 'POST':
      return createProduct(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getProducts(req, res) {
  try {
    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createProduct(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const { name, description, price, originalPrice, category, material, color, size, quantity, stock, inStock, images } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const imageArray = images || [];

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
        ${imageArray}
      )
      RETURNING *
    `;

    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
