-- CineAI Database Schema
-- This file initializes the PostgreSQL database for production use

-- Create database (if using PostgreSQL)
-- CREATE DATABASE cineai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('movie', 'series')),
    genre TEXT[] NOT NULL,
    rating DECIMAL(3,1) DEFAULT 0.0,
    duration VARCHAR(50),
    description TEXT,
    poster VARCHAR(500),
    backdrop VARCHAR(500),
    cast TEXT[] DEFAULT '{}',
    director VARCHAR(255),
    confidence INTEGER DEFAULT 0,
    platforms JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_type VARCHAR(20) NOT NULL CHECK (search_type IN ('text', 'image', 'video', 'actor')),
    query TEXT,
    results_count INTEGER DEFAULT 0,
    confidence INTEGER DEFAULT 0,
    processing_time INTEGER DEFAULT 0,
    ai_provider VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table (for JWT blacklisting)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_type ON movies(type);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies USING GIN(genre);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO users (name, email, password, role, preferences) VALUES
('Demo User', 'demo@cineai.com', '$2a$12$rOvHPGkwxaXGwxkOVHMoUeQs7QGWqNVOa8T5fKMxEQGwxaXGwxkOV', 'user', '{"favoriteGenres": ["Action", "Sci-Fi", "Drama"], "preferredLanguages": ["English", "Spanish"]}'),
('Admin User', 'admin@cineai.com', '$2a$12$rOvHPGkwxaXGwxkOVHMoUeQs7QGWqNVOa8T5fKMxEQGwxaXGwxkOV', 'admin', '{"favoriteGenres": ["All"], "preferredLanguages": ["English"]}')
ON CONFLICT (email) DO NOTHING;

-- Sample movies
INSERT INTO movies (title, year, type, genre, rating, duration, description, poster, backdrop, cast, director, confidence, platforms) VALUES
('The Matrix', 1999, 'movie', ARRAY['Sci-Fi', 'Action'], 8.7, '136 min', 'A computer programmer discovers that reality as he knows it is a simulation controlled by machines.', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'], 'The Wachowskis', 95, '[{"name": "Netflix", "logo": "🎬", "available": true, "subscription": true}]'),
('Inception', 2010, 'movie', ARRAY['Sci-Fi', 'Thriller'], 8.8, '148 min', 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'], 'Christopher Nolan', 92, '[{"name": "Amazon Prime", "logo": "📺", "available": true, "subscription": true}]'),
('Breaking Bad', 2008, 'series', ARRAY['Drama', 'Crime'], 9.5, '47 min/episode', 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student.', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'], 'Vince Gilligan', 98, '[{"name": "Netflix", "logo": "🎬", "available": true, "subscription": true}]')
ON CONFLICT DO NOTHING;

-- Clean up expired sessions (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;