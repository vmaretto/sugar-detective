// api/config.js - API per gestire configurazioni esperienze
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Ottieni configurazione attiva o tutte le configurazioni
    if (req.method === 'GET') {
      const { active } = req.query;
      
      if (active === 'true') {
        // Ottieni solo la configurazione attiva con i suoi alimenti e coppie
        const configResult = await pool.query(
          'SELECT * FROM experience_config WHERE is_active = true LIMIT 1'
        );
        
        if (configResult.rows.length === 0) {
          return res.status(404).json({ error: 'No active configuration found' });
        }
        
        const config = configResult.rows[0];
        
        // Ottieni gli alimenti selezionati
        const foodsResult = await pool.query(
          'SELECT * FROM foods WHERE id = ANY($1) ORDER BY display_order',
          [config.selected_food_ids]
        );
        
        // Ottieni le coppie di comparazione
        const pairsResult = await pool.query(
          'SELECT * FROM comparison_pairs WHERE config_id = $1 ORDER BY order_position',
          [config.id]
        );
        
        return res.status(200).json({
          config,
          foods: foodsResult.rows,
          pairs: pairsResult.rows
        });
      } else {
        // Ottieni tutte le configurazioni
        const result = await pool.query(
          'SELECT * FROM experience_config ORDER BY created_at DESC'
        );
        return res.status(200).json(result.rows);
      }
    }

    // POST - Crea nuova configurazione
    if (req.method === 'POST') {
      const { name, description, selected_food_ids, pairs, activate } = req.body;
      
      if (!name || !selected_food_ids || selected_food_ids.length === 0) {
        return res.status(400).json({ 
          error: 'Missing required fields: name and selected_food_ids' 
        });
      }
      
      // Se activate è true, disattiva tutte le altre configurazioni
      if (activate) {
        await pool.query('UPDATE experience_config SET is_active = false');
      }
      
      // Crea la configurazione
      const configResult = await pool.query(
        `INSERT INTO experience_config (name, description, selected_food_ids, is_active) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, selected_food_ids, activate || false]
      );
      
      const config = configResult.rows[0];
      
      // Crea le coppie di comparazione se fornite
      if (pairs && pairs.length > 0) {
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          await pool.query(
            `INSERT INTO comparison_pairs (config_id, food_a_id, food_b_id, order_position)
             VALUES ($1, $2, $3, $4)`,
            [config.id, pair.food_a_id, pair.food_b_id, i]
          );
        }
      }
      
      return res.status(201).json({
        success: true,
        config
      });
    }

    // PUT - Aggiorna configurazione esistente
    if (req.method === 'PUT') {
      const { id, name, description, selected_food_ids, pairs, activate } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing config id' });
      }
      
      // Se activate è true, disattiva tutte le altre
      if (activate) {
        await pool.query('UPDATE experience_config SET is_active = false');
      }
      
      // Aggiorna la configurazione
      const configResult = await pool.query(
        `UPDATE experience_config 
         SET name = $1, description = $2, selected_food_ids = $3, 
             is_active = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 RETURNING *`,
        [name, description, selected_food_ids, activate || false, id]
      );
      
      if (configResult.rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      
      // Elimina vecchie coppie e crea le nuove
      await pool.query('DELETE FROM comparison_pairs WHERE config_id = $1', [id]);
      
      if (pairs && pairs.length > 0) {
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          await pool.query(
            `INSERT INTO comparison_pairs (config_id, food_a_id, food_b_id, order_position)
             VALUES ($1, $2, $3, $4)`,
            [id, pair.food_a_id, pair.food_b_id, i]
          );
        }
      }
      
      return res.status(200).json({
        success: true,
        config: configResult.rows[0]
      });
    }

    // DELETE - Elimina configurazione
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing config id' });
      }
      
      // Verifica che non sia l'unica configurazione attiva
      const checkResult = await pool.query(
        'SELECT COUNT(*) as count FROM experience_config WHERE is_active = true'
      );
      
      const activeConfig = await pool.query(
        'SELECT is_active FROM experience_config WHERE id = $1',
        [id]
      );
      
      if (activeConfig.rows[0]?.is_active && checkResult.rows[0].count === 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the only active configuration' 
        });
      }
      
      await pool.query('DELETE FROM experience_config WHERE id = $1', [id]);
      
      return res.status(200).json({ 
        success: true,
        message: 'Configuration deleted' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Config API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
