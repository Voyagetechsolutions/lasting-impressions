import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getRequests(req, res);
    case 'POST':
      return createRequest(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getRequests(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const requests = await sql`SELECT * FROM custom_requests ORDER BY created_at DESC`;

    const formattedRequests = requests.map(request => ({
      id: request.id,
      customer: {
        firstName: request.customer_first_name,
        lastName: request.customer_last_name,
        email: request.customer_email,
        phone: request.customer_phone,
      },
      description: request.description,
      specifications: request.specifications || {},
      images: request.images || [],
      status: request.status,
      quote: request.quote,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Get custom requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createRequest(req, res) {
  try {
    const { customer, description, specifications } = req.body;

    if (!customer || !description) {
      return res.status(400).json({ error: 'Customer info and description are required' });
    }

    const newRequest = await sql`
      INSERT INTO custom_requests (
        customer_first_name, customer_last_name, customer_email, customer_phone,
        description, specifications
      )
      VALUES (
        ${customer.firstName},
        ${customer.lastName},
        ${customer.email},
        ${customer.phone || null},
        ${description},
        ${specifications ? JSON.stringify(specifications) : null}
      )
      RETURNING *
    `;

    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error('Create custom request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
