import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getClass(req, res, id);
    case 'PUT':
      return updateClass(req, res, id);
    case 'DELETE':
      return deleteClass(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getClass(req, res, id) {
  try {
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
}

async function updateClass(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
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
}

async function deleteClass(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const deleted = await sql`DELETE FROM classes WHERE id = ${id} RETURNING *`;

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
