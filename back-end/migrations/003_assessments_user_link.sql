ALTER TABLE assessments ADD COLUMN user_id INT;
CREATE INDEX idx_assessments_user_id ON assessments (user_id);
