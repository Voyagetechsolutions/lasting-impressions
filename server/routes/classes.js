import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all classes (public)
router.get('/', async (req, res) => {
    try {
        const classes = await sql`SELECT * FROM classes ORDER BY date ASC`;

        // Transform to match frontend format
        const formattedClasses = classes.map(cls => ({
            id: cls.id,
            title: cls.title,
            description: cls.description,
            level: cls.level,
            date: cls.date,
            time: cls.time,
            duration: cls.duration,
            price: parseFloat(cls.price),
            instructor: cls.instructor,
            spots: cls.spots,
            spotsLeft: cls.spots_left,
            type: cls.type,
            image: cls.image,
            createdAt: cls.created_at,
            updatedAt: cls.updated_at,
        }));

        res.json(formattedClasses);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single class (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const classes = await sql`SELECT * FROM classes WHERE id = ${id} LIMIT 1`;

        if (classes.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const cls = classes[0];
        res.json({
            id: cls.id,
            title: cls.title,
            description: cls.description,
            level: cls.level,
            date: cls.date,
            time: cls.time,
            duration: cls.duration,
            price: parseFloat(cls.price),
            instructor: cls.instructor,
            spots: cls.spots,
            spotsLeft: cls.spots_left,
            type: cls.type,
            image: cls.image,
        });
    } catch (error) {
        console.error('Get class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create class (protected)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, level, date, time, duration, price, instructor, spots, type, image } = req.body;

        if (!title || !price) {
            return res.status(400).json({ error: 'Title and price are required' });
        }

        const newClass = await sql`
      INSERT INTO classes (title, description, level, date, time, duration, price, instructor, spots, spots_left, type, image)
      VALUES (
        ${title},
        ${description || null},
        ${level || 'Beginner'},
        ${date || null},
        ${time || null},
        ${duration || null},
        ${parseFloat(price)},
        ${instructor || null},
        ${parseInt(spots) || 10},
        ${parseInt(spots) || 10},
        ${type || 'in-person'},
        ${image || null}
      )
      RETURNING *
    `;

        res.status(201).json(newClass[0]);
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update class (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, level, date, time, duration, price, instructor, spots, spotsLeft, type, image } = req.body;

        const updated = await sql`
      UPDATE classes
      SET title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          level = COALESCE(${level}, level),
          date = COALESCE(${date}, date),
          time = COALESCE(${time}, time),
          duration = COALESCE(${duration}, duration),
          price = COALESCE(${price ? parseFloat(price) : null}, price),
          instructor = COALESCE(${instructor}, instructor),
          spots = COALESCE(${spots ? parseInt(spots) : null}, spots),
          spots_left = COALESCE(${spotsLeft ? parseInt(spotsLeft) : null}, spots_left),
          type = COALESCE(${type}, type),
          image = COALESCE(${image}, image),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        if (updated.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(updated[0]);
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete class (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await sql`DELETE FROM classes WHERE id = ${id} RETURNING *`;

        if (deleted.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
