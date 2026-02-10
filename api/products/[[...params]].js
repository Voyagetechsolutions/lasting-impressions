import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const id = req.query.params?.[0];

  if (id) {
    // Single product routes: /api/products/:id
    switch (req.method) {
      case 'GET':
        return getProduct(req, res, id);
      case 'PUT':
        return updateProduct(req, res, id);
      case 'DELETE':
        return deleteProduct(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    // Collection routes: /api/products
    switch (req.method) {
      case 'GET':
        return getProducts(req, res);
      case 'POST':
        return createProduct(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
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
  const user = await requireAuth(req, res);
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

async function getProduct(req, res, id) {
  try {
    const products = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateProduct(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const { name, description, price, originalPrice, category, material, color, size, quantity, stock, inStock, images } = req.body;

    const allImages = images || [];

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
}

async function deleteProduct(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const deleted = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
