# Node.js REST API with PostgreSQL

A RESTful API built with Express.js and PostgreSQL for task management.

## Features

- ✅ **PostgreSQL Database**: Full PostgreSQL integration with connection
  pooling
- ✅ **Auto Database Setup**: Automatically creates database and tables on
  startup
- ✅ **Task Management**: Complete CRUD operations for tasks
- ✅ **Raw SQL**: Pure SQL implementation without ORM
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Environment Configuration**: Configurable via environment variables

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Application Configuration
APP_PORT=3000
APP_DEBUG=true
API_VERSION=v1
NODE_ENV=development
APP_NAME=tasks-api

# Database Configuration
# Option 1: Individual connection parameters
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=tasks_db

# Option 2: Connection string (takes precedence if provided)
# DATABASE_URL=postgres://username:password@localhost:5432/tasks_db

# Database Pool Configuration
DB_POOL_MAX=10
DB_IDLE_MS=30000
DB_CONNECT_MS=5000

# Optional: Admin database URL for automatic database creation
# DB_ADMIN_URL=postgres://postgres:password@localhost:5432/postgres
```

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will automatically:

- Connect to PostgreSQL using connection pooling
- Create the database if it doesn't exist (when `DB_ADMIN_URL` is provided)
- Create the tasks table and triggers
- Start the server on http://localhost:3000

## Database Connection Options

The application supports two ways to configure database connections:

1. **Individual Parameters**: Set `DB_HOST`, `DB_PORT`, `DB_USER`,
   `DB_PASSWORD`, and `DB_NAME`
2. **Connection String**: Set `DATABASE_URL` (takes precedence if both are
   provided)

### Connection Pool Configuration

The application uses PostgreSQL connection pooling with the following
configurable options:

- `DB_POOL_MAX`: Maximum number of connections in the pool (default: 10)
- `DB_IDLE_MS`: Idle timeout in milliseconds (default: 30000)
- `DB_CONNECT_MS`: Connection timeout in milliseconds (default: 5000)
- `APP_NAME`: Application name for database connections (default: tasks-api)

### Automatic Database Creation

If you provide a `DB_ADMIN_URL` environment variable, the application can
automatically create the target database if it doesn't exist. This is useful for
development environments.

## API Endpoints

### Base Information

- **GET** `/` - Get API information and version

### Task Management

#### Get All Tasks

- **GET** `/api/v1/tasks`
- **Description**: Retrieve all tasks ordered by creation date (newest first)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "tasks": [...],
    "count": 5
  }
  ```

#### Get Single Task

- **GET** `/api/v1/tasks/:taskID`
- **Description**: Retrieve a specific task by ID
- **Parameters**:
  - `taskID` (integer) - The task ID
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task retrieved successfully",
    "task": {
      "id": 1,
      "title": "Sample Task",
      "description": "Task description",
      "completed": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Create New Task

- **POST** `/api/v1/tasks`
- **Description**: Create a new task
- **Request Body**:
  ```json
  {
    "title": "Task Title (required, max 255 chars)",
    "description": "Task description (optional)",
    "completed": false
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "task": { ... }
  }
  ```

#### Update Task

- **PUT** `/api/v1/tasks/:taskID`
- **Description**: Update an existing task (partial updates supported)
- **Parameters**:
  - `taskID` (integer) - The task ID
- **Request Body** (all fields optional):
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description",
    "completed": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "task": { ... }
  }
  ```

#### Delete Task

- **DELETE** `/api/v1/tasks/:taskID`
- **Description**: Delete a specific task
- **Parameters**:
  - `taskID` (integer) - The task ID
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully",
    "task": { ... }
  }
  ```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `404` - Not Found (task doesn't exist)
- `500` - Internal Server Error

## Database Functions

The database module exports the following functions:

```javascript
import {
  pool,
  query,
  withTransaction,
  createDatabaseIfNotExists,
  ensureSchema,
  closeDatabase
} from './src/config/database.js'

// Execute parameterized queries
const result = await query('SELECT * FROM tasks WHERE id = $1', [taskId])

// Use transactions for multiple operations
const result = await withTransaction(async (client) => {
  await client.query('INSERT INTO tasks (title) VALUES ($1)', ['Task 1'])
  await client.query('INSERT INTO tasks (title) VALUES ($1)', ['Task 2'])
  return { success: true }
})

// Optional: Create database if it doesn't exist (requires DB_ADMIN_URL)
await createDatabaseIfNotExists()

// Optional: Ensure schema exists (for development)
await ensureSchema()

// Close database connection
await closeDatabase()
```

### Transaction Support

The `withTransaction` helper automatically handles BEGIN/COMMIT/ROLLBACK
operations:

```javascript
try {
  const result = await withTransaction(async (client) => {
    // All queries here are part of the same transaction
    const task = await client.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      ['New Task']
    )
    await client.query('UPDATE tasks SET completed = true WHERE id = $1', [
      task.rows[0].id
    ])
    return task.rows[0]
  })
  console.log('Transaction completed:', result)
} catch (error) {
  console.error('Transaction failed:', error)
  // Rollback was handled automatically
}
```

## Deployment to Vercel

This application is configured for deployment to Vercel. Follow these steps:

### Prerequisites

1. **Database Setup**: You'll need a production PostgreSQL database. Options
   include:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com/)
   - [Neon](https://neon.tech/)
   - [Railway](https://railway.app/)
   - [PlanetScale](https://planetscale.com/) (MySQL alternative)

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:

   ```bash
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:

   - Go to your project in Vercel Dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:

   ```env
   NODE_ENV=production
   API_VERSION=v1
   APP_NAME=tasks-api
   DATABASE_URL=your_production_database_url_here
   ```

   **Important**: Make sure your `DATABASE_URL` points to your production
   database.

### Vercel Configuration

The project includes:

- `vercel.json` - Vercel deployment configuration
- `api/index.js` - Serverless function entry point
- `.vercelignore` - Files to exclude from deployment

### Database Considerations

- The application automatically handles SSL connections for production databases
- Make sure your production database allows connections from Vercel's IP ranges
- Consider using connection pooling services like PgBouncer for better
  performance

### Environment Variables for Production

```env
NODE_ENV=production
API_VERSION=v1
APP_NAME=tasks-api
DATABASE_URL=postgres://username:password@host:port/database?sslmode=require
```

### Testing the Deployment

After deployment, test your API endpoints:

- `GET https://your-app.vercel.app/` - Should return API information
- `GET https://your-app.vercel.app/api/v1/tasks` - Should return tasks (empty
  array initially)

### Troubleshooting

1. **Database Connection Issues**:

   - Verify your `DATABASE_URL` is correct
   - Ensure your database allows external connections
   - Check that SSL is properly configured

2. **Function Timeout**:

   - Vercel functions have a 10-second timeout on Hobby plan
   - Consider upgrading to Pro plan for longer timeouts

3. **Cold Starts**:
   - First request after inactivity may be slower
   - This is normal for serverless functions
