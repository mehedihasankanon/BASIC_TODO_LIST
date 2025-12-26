-- CREATE DATABASE newtest;

CREATE TABLE todo (
    todo_id SERIAL PRIMARY KEY,
    description VARCHAR (255) NOT NULL
);

ALTER TABLE todo ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

SELECT * FROM todo;



-- ============================================================================
-- Table: refresh_tokens
-- Purpose: Store JWT refresh tokens for user session management
-- Description: This table maintains a record of issued refresh tokens,
--              allowing the server to invalidate tokens on logout and track
--              token usage for security purposes.
-- ============================================================================

CREATE TABLE refresh_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    -- This line defines a foreign key constraint on the 'user_id' column, 
    -- establishing a relationship between the current table and the 'users' table.
    -- The 'REFERENCES users(user_id)' clause specifies that 'user_id' in the current table 
    -- must match a valid 'user_id' in the 'users' table.
    -- The 'ON DELETE CASCADE' option ensures that if a user is deleted from the 'users' table,
    -- all related records in the current table will also be automatically deleted.
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create an index on user_id for faster token lookups by user
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Create an index on token for quick validation checks
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Create an index on expires_at for cleanup queries of expired tokens
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);