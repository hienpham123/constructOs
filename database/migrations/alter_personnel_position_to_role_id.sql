-- Migration: Change personnel.position from ENUM to role_id (CHAR(36))
-- This allows position to reference roles table

-- For MySQL
ALTER TABLE personnel 
  MODIFY COLUMN position CHAR(36) NOT NULL,
  ADD CONSTRAINT fk_personnel_role FOREIGN KEY (position) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD INDEX idx_personnel_position (position);

-- For PostgreSQL (if using)
-- ALTER TABLE personnel 
--   DROP CONSTRAINT IF EXISTS personnel_position_check,
--   ALTER COLUMN position TYPE UUID USING position::uuid,
--   ADD CONSTRAINT fk_personnel_role FOREIGN KEY (position) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
-- CREATE INDEX IF NOT EXISTS idx_personnel_position ON personnel(position);

