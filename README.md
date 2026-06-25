# Finance Tracker — Express Backend

REST API for the Finance Tracker app, built with Node.js + Express and connected to Supabase.
Deployed as a serverless function on Vercel.

## Project Structure

```
finance-backend/
├── index.js              # Entry point (exports Express app for Vercel)
├── supabase.js           # Supabase client
├── routes/
│   ├── users.js
│   ├── accounts.js
│   ├── categories.js
│   ├── transactions.js   # Includes CSV import with duplicate detection
│   └── balances.js       # Opening balances + account balance report
├── vercel.json           # Vercel deployment config
├── .env                  # Local secrets (never commit this)
├── .env.example          # Template for env vars
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
   Fill in:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   API available at `http://localhost:3000`

## Deploy to Vercel

### Option A — Vercel CLI (recommended)
```bash
npm install -g vercel
vercel login
vercel
```
Follow the prompts. When asked, set these environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

To deploy to production:
```bash
vercel --prod
```

### Option B — Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import Git Repository
3. Add environment variables in the Vercel dashboard:
   - `SUPABASE_URL` = `https://yosoldojvnkcwjjofnzc.supabase.co`
   - `SUPABASE_SERVICE_KEY` = your service role key
4. Click Deploy

Vercel gives you a URL like `https://finance-backend-xxx.vercel.app`

## Connect Frontend

In your React frontend `.env`:
```
VITE_API_BASE_URL=https://your-vercel-url.vercel.app/api
```

## CSV Import Format

```
account_id,category_id,type,amount,date,description
1,2,OUT,500,2024-01-15,Groceries
1,3,IN,15000,2024-01-01,Salary
```

Required headers: `account_id`, `category_id`, `type`, `amount`, `date`
Optional: `description`
Duplicate rows are automatically skipped using SHA-256 hashing.
