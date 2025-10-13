-- Sugar Detective Database Schema for Vercel Postgres

-- Foods table
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name_it VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    is_reference BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    language VARCHAR(10) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default foods
INSERT INTO foods (name_it, name_en, emoji, is_reference) VALUES
('Mela', 'Apple', '🍎', TRUE),
('Banana', 'Banana', '🍌', FALSE),
('Anguria', 'Watermelon', '🍉', FALSE),
('Pomodoro', 'Tomato', '🍅', FALSE),
('Carota', 'Carrot', '🥕', FALSE),
('Peperone', 'Bell Pepper', '🫑', FALSE)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_timestamp ON participants(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_participants_language ON participants(language);
CREATE INDEX IF NOT EXISTS idx_foods_reference ON foods(is_reference);
