// api/participants.js
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Fetch all participants
      const { rows } = await sql`
        SELECT * FROM participants ORDER BY timestamp DESC
      `;
      res.status(200).json(rows);
    } else if (req.method === 'POST') {
      // Add new participant data
      const data = req.body;
      
      const { rows } = await sql`
        INSERT INTO participants (
          timestamp,
          language,
          data
        )
        VALUES (
          ${data.timestamp},
          ${data.language},
          ${JSON.stringify(data)}
        )
        RETURNING *
      `;
      
      res.status(201).json(rows[0]);
    } else if (req.method === 'DELETE') {
      // Delete all participants (for reset)
      await sql`DELETE FROM participants`;
      res.status(200).json({ success: true, message: 'All participants deleted' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
}
