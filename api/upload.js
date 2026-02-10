import { put } from '@vercel/blob';
import { requireAuth } from './_lib/auth.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const filename = req.query.filename;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const blob = await put(filename, req, {
      access: 'public',
    });

    res.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
