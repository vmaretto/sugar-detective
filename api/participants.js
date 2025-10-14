// api/participants.js - FIXED TIMESTAMP VERSION
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM participants ORDER BY timestamp DESC'
      );
      return res.status(200).json(result.rows);
    }

    // POST
    if (req.method === 'POST') {
      const body = req.body;
      
      console.log('Received payload');
      
      // Estrai language
      const language = body.language || 'it';
      
      // Rimuovi il campo timestamp dal payload se esiste
      // perché la colonna timestamp del DB si auto-genera
      const { timestamp, ...dataWithoutTimestamp } = body;
      
      console.log('Language:', language);
      
      // Insert nel database - il timestamp si genera automaticamente
      const result = await pool.query(
        'INSERT INTO participants (language, data) VALUES ($1, $2) RETURNING *',
        [language, dataWithoutTimestamp]
      );

      console.log('Successfully saved participant ID:', result.rows[0].id);
      
      return res.status(201).json({
        success: true,
        id: result.rows[0].id,
        timestamp: result.rows[0].timestamp
      });
    }

    // DELETE
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM participants');
      return res.status(200).json({ 
        message: 'All participants deleted' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error.message);
    console.error('Error details:', error);
    
    return res.status(500).json({ 
      error: 'Database operation failed',
      message: error.message
    });
  }
}
