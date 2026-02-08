-- ================================================================
-- RUN THIS IN pgAdmin QUERY TOOL TO RESET PASSWORD
-- ================================================================
--
-- INSTRUCTIONS:
-- 1. In pgAdmin, click on "PostgreSQL 18" in the left panel
-- 2. Go to: Tools → Query Tool (or press Alt+Shift+Q)
-- 3. Copy the line below (without the -- comment)
-- 4. Paste it in the Query Tool
-- 5. Press F5 or click the Execute button (▶️)
-- 6. You should see "ALTER ROLE" in the output
--
-- ================================================================

ALTER USER postgres WITH PASSWORD '5432';

-- ================================================================
-- After running this, you should see:
-- "ALTER ROLE"
-- "Query returned successfully in XX msec."
-- ================================================================
