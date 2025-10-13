// api/participants.js - Compatible with Neon/Standard Postgres
import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Fetch all participants
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM participants ORDER BY timestamp DESC'
      );
      return res.status(200).json(result.rows);
    }

    // POST - Create new participant
    if (req.method === 'POST') {
      const { language, data } = req.body;

      if (!language || !data) {
        return res.status(400).json({ 
          error: 'Missing required fields: language and data' 
        });
      }

      const result = await pool.query(
        'INSERT INTO participants (language, data) VALUES ($1, $2) RETURNING *',
        [language, JSON.stringify(data)]
      );

      return res.status(201).json(result.rows[0]);
    }

    // DELETE - Delete all participants (admin only)
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM participants');
      return res.status(200).json({ 
        message: 'All participants deleted successfully' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message 
    });
  }
}
