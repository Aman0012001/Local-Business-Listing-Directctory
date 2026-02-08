# 🔧 Database Connection Setup for 'webapp' Database

## Current Configuration

Your application is now configured to connect to the `webapp` database:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=webapp
```

## ⚠️ Connection Issue Detected

The application tried to start but couldn't connect to the database. Here's how to fix it:

### Option 1: Update the Password (Most Likely)

The password `postgres` might not be correct. Update it in `.env`:

1. Open `apps/api/.env`
2. Change the line:
   ```env
   DB_PASSWORD=your_actual_postgres_password
   ```

### Option 2: Verify Database Exists

Make sure the `webapp` database exists in PostgreSQL:

#### Using pgAdmin:
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Check if `webapp` database exists in the left panel
4. If not, right-click "Databases" → "Create" → "Database" → Name it `webapp`

#### Using Command Line (if psql is available):
```sql
-- Connect to PostgreSQL
psql -U postgres

-- List all databases
\l

-- If webapp doesn't exist, create it:
CREATE DATABASE webapp;

-- Exit
\q
```

### Option 3: Check PostgreSQL Service

Make sure PostgreSQL is running:

#### Windows:
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Look for "postgresql" service
4. Make sure it's "Running"
5. If not, right-click → "Start"

## 🚀 After Fixing

Once you've updated the password or created the database:

```bash
cd apps/api
npm run start:dev
```

Then open your browser to:
```
http://localhost:3000/users
```

You should see: `[]` (empty array)

## 🧪 Test Your Connection

To test if the database connection works:

```bash
npm run test:db
```

This will show you if the connection is successful or what the error is.

## 📝 Common PostgreSQL Passwords

Try these common default passwords:
- `postgres`
- `admin`
- `root`
- (empty - just leave it blank)
- Your Windows password
- Password you set during PostgreSQL installation

## Need Help?

If you're still having issues, please provide:
1. The exact error message from the terminal
2. Your PostgreSQL version
3. Whether the `webapp` database exists

---

**Quick Fix Command:**
```bash
# Try this to see the actual error:
npm run start:dev
```

Look for lines that say "ERROR" or "password authentication failed" or "database does not exist"
