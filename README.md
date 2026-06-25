# Finance Tracker — Express Backend

REST API for the Finance Tracker app, built with Node.js + Express and connected to Supabase.

## Project Structure

```
finance-backend/
├── index.js              # Entry point
├── supabase.js           # Supabase client
├── routes/
│   ├── users.js
│   ├── accounts.js
│   ├── categories.js
│   ├── transactions.js   # Includes CSV import with duplicate detection
│   └── balances.js       # Opening balances + account balance report
├── .env                  # Local secrets (never commit this)
├── .env.example          # Template for env vars
├── railway.json          # Railway deployment config
└── package.json
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | List all users |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| GET | /api/accounts | List all accounts |
| POST | /api/accounts | Create account |
| PUT | /api/accounts/:id | Update account |
| DELETE | /api/accounts/:id | Delete account |
| GET | /api/categories | List all categories |
| POST | /api/categories | Create category |
| PUT | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |
| GET | /api/transactions | List all transactions |
| POST | /api/transactions | Create transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| POST | /api/transactions/import | Import CSV transactions |
| GET | /api/balances | List all opening balances |
| POST | /api/balances | Add/update opening balance |
| GET | /api/balances/account-balance | Get balance report for account+month |

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your `.env` file**
   ```bash
   cp .env.example .env
   ```
   Then fill in your Supabase credentials:
   ```
   PORT=3000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

3. **Run locally**
   ```bash
   npm run dev     # with auto-reload (Node 18+)
   # or
   npm start       # standard
   ```

4. **Test the API**
   ```bash
   curl http://localhost:3000/
   curl http://localhost:3000/api/users
   ```

## CSV Import Format

The CSV import endpoint (`POST /api/transactions/import`) expects:

```
account_id,category_id,type,amount,date,description
1,2,OUT,500,2024-01-15,Groceries
1,3,IN,15000,2024-01-01,Salary
```

- **Required headers:** `account_id`, `category_id`, `type`, `amount`, `date`
- **Optional:** `description`
- Duplicate rows are automatically skipped using SHA-256 hashing

## Deploy to Railway

1. Push this folder to a GitHub repository
2. Go to [railway.app](https://railway.app) and create a new project
3. Connect your GitHub repo
4. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
5. Railway auto-deploys on every push to main

## Connect Frontend

In your frontend `.env`:
```
VITE_API_BASE_URL=https://your-railway-app.up.railway.app/api
```
