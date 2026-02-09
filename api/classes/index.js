import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getClasses(req, res);
    case 'POST':
      return createClass(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getClasses(req, res) {
  try {
    const classes = await sql`SELECT * FROM classes ORDER BY date ASC`;

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
}

async function createClass(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

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
}
