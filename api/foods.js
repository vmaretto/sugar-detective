// api/foods.js
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Fetch all foods
      const { rows } = await sql`
        SELECT * FROM foods ORDER BY name_it
      `;
      res.status(200).json(rows);
    } else if (req.method === 'POST') {
      // Add new food
      const { name_it, name_en, emoji, isReference } = req.body;
      
      const { rows } = await sql`
        INSERT INTO foods (name_it, name_en, emoji, is_reference)
        VALUES (${name_it}, ${name_en}, ${emoji}, ${isReference})
        RETURNING *
      `;
      
      res.status(201).json(rows[0]);
    } else if (req.method === 'PUT') {
      // Update food
      const { id, name_it, name_en, emoji, isReference } = req.body;
      
      const { rows } = await sql`
        UPDATE foods
        SET name_it = ${name_it}, name_en = ${name_en}, emoji = ${emoji}, is_reference = ${isReference}
        WHERE id = ${id}
        RETURNING *
      `;
      
      res.status(200).json(rows[0]);
    } else if (req.method === 'DELETE') {
      // Delete food
      const { id } = req.query;
      
      await sql`DELETE FROM foods WHERE id = ${id}`;
      
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
}
