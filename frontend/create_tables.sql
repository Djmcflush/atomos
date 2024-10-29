-- Create the Atomics table if it doesn't exist
CREATE TABLE IF NOT EXISTS Atomics (
    id SERIAL PRIMARY KEY,
    protons INTEGER NOT NULL,
    neutrons INTEGER NOT NULL,
    electrons INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the id column for faster lookups
CREATE INDEX IF NOT EXISTS idx_Atomics_id ON Atomics(id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_Atomics_modtime
    BEFORE UPDATE ON Atomics
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
