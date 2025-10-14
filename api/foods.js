// api/foods.js - Compatible with Neon/Standard Postgres
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Fetch foods
    if (req.method === 'GET') {
      const { category, active } = req.query;
      
      let query = 'SELECT * FROM foods WHERE 1=1';
      const params = [];
      let paramCount = 1;
      
      // Filter by category (fruit/vegetable)
      if (category) {
        query += ` AND category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }
      
      // Filter by active status
      if (active !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        params.push(active === 'true');
        paramCount++;
      }
      
      query += ' ORDER BY display_order ASC, id ASC';
      
      const result = await pool.query(query, params);
      return res.status(200).json(result.rows);
    }

    // POST - Create new food (admin only)
    if (req.method === 'POST') {
      const { 
        name_it, name_en, emoji, sugar_g, portion_g, 
        is_reference, display_order, category, season 
      } = req.body;
      
      if (!name_it || !name_en || !emoji) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const result = await pool.query(
        `INSERT INTO foods 
         (name_it, name_en, emoji, sugar_g, portion_g, is_reference, display_order, category, season, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
         RETURNING *`,
        [name_it, name_en, emoji, sugar_g || 0, portion_g || 100, 
         is_reference || false, display_order || 999, category || 'fruit', season]
      );
      
      return res.status(201).json(result.rows[0]);
    }

    // PUT - Update food
    if (req.method === 'PUT') {
      const { id, name_it, name_en, emoji, sugar_g, portion_g, 
              is_reference, display_order, category, season, is_active } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing food id' });
      }
      
      const result = await pool.query(
        `UPDATE foods 
         SET name_it = $1, name_en = $2, emoji = $3, sugar_g = $4, 
             portion_g = $5, is_reference = $6, display_order = $7,
             category = $8, season = $9, is_active = $10
         WHERE id = $11
         RETURNING *`,
        [name_it, name_en, emoji, sugar_g, portion_g, is_reference, 
         display_order, category, season, is_active, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Food not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    // DELETE - Delete food
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing food id' });
      }
      
      await pool.query('DELETE FROM foods WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
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
