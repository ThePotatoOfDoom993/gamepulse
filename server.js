const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'gamer',
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profile JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Games table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        platform VARCHAR(100),
        genre VARCHAR(100),
        cover TEXT,
        status VARCHAR(50) DEFAULT 'backlog',
        playtime DECIMAL DEFAULT 0,
        notes TEXT,
        added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_played TIMESTAMP,
        completed_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blog posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        content TEXT,
        tags TEXT[],
        status VARCHAR(50) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0
      )
    `);

    // Game sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        hours DECIMAL NOT NULL,
        session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default users if they don't exist
    const hashedOwnerPassword = await bcrypt.hash('minecraftplayer961400', 10);
    const hashedDemoPassword = await bcrypt.hash('demo123', 10);
    
    await pool.query(`
      INSERT INTO users (email, password, name, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO NOTHING
    `, ['aterrealms@gmail.com', hashedOwnerPassword, 'Website Owner', 'owner']);

    await pool.query(`
      INSERT INTO users (email, password, name, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO NOTHING
    `, ['demo@gamepulse.com', hashedDemoPassword, 'Demo User', 'gamer']);

    console.log('✅ Database tables initialized with default users');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// ==================== API ROUTES ====================

// User registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, name, role = 'gamer' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role, join_date, created_at`,
      [email, hashedPassword, name, role]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'User already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, join_date, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user's games
app.get('/api/games', async (req, res) => {
  try {
    const userId = req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM games WHERE user_id = $1 ORDER BY added_date DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Add new game
app.post('/api/games', async (req, res) => {
  try {
    const { user_id, title, platform, genre, cover = '🎮' } = req.body;
    
    if (!user_id || !title) {
      return res.status(400).json({ error: 'User ID and title are required' });
    }

    const result = await pool.query(
      `INSERT INTO games (user_id, title, platform, genre, cover) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user_id, title, platform, genre, cover]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add game error:', error);
    res.status(500).json({ error: 'Failed to add game' });
  }
});

// Update game
app.put('/api/games/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const { title, platform, genre, status, playtime, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE games 
       SET title = $1, platform = $2, genre = $3, status = $4, playtime = $5, notes = $6,
           last_played = CASE WHEN $4 = 'playing' THEN CURRENT_TIMESTAMP ELSE last_played END,
           completed_date = CASE WHEN $4 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_date END
       WHERE id = $7 
       RETURNING *`,
      [title, platform, genre, status, playtime, notes, gameId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Update game playtime
app.post('/api/games/:id/playtime', async (req, res) => {
  try {
    const gameId = req.params.id;
    const { hours, user_id } = req.body;
    
    if (!hours || !user_id) {
      return res.status(400).json({ error: 'Hours and user ID are required' });
    }

    // Update game playtime
    const gameResult = await pool.query(
      `UPDATE games 
       SET playtime = playtime + $1, 
           last_played = CURRENT_TIMESTAMP,
           status = 'playing'
       WHERE id = $2 
       RETURNING *`,
      [hours, gameId]
    );
    
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Log session
    await pool.query(
      'INSERT INTO game_sessions (game_id, user_id, hours) VALUES ($1, $2, $3)',
      [gameId, user_id, hours]
    );
    
    res.json({ 
      message: 'Playtime logged successfully', 
      game: gameResult.rows[0] 
    });
  } catch (error) {
    console.error('Log playtime error:', error);
    res.status(500).json({ error: 'Failed to log playtime' });
  }
});

// Delete game
app.delete('/api/games/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    
    const result = await pool.query(
      'DELETE FROM games WHERE id = $1 RETURNING *',
      [gameId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ message: 'Game deleted successfully', game: result.rows[0] });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

// Get blog posts
app.get('/api/blogs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT bp.*, u.name as author_name, u.role as author_role 
      FROM blog_posts bp 
      JOIN users u ON bp.user_id = u.id 
      WHERE status = 'published' 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Create blog post
app.post('/api/blogs', async (req, res) => {
  try {
    const { user_id, title, category, content, tags = [] } = req.body;
    
    if (!user_id || !title || !content) {
      return res.status(400).json({ error: 'User ID, title, and content are required' });
    }

    const result = await pool.query(
      `INSERT INTO blog_posts (user_id, title, category, content, tags) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user_id, title, category, content, tags]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Get user statistics
app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const gamesResult = await pool.query(
      'SELECT COUNT(*) as total_games, SUM(playtime) as total_playtime FROM games WHERE user_id = $1',
      [userId]
    );
    
    const blogsResult = await pool.query(
      'SELECT COUNT(*) as blog_count FROM blog_posts WHERE user_id = $1',
      [userId]
    );
    
    const completedResult = await pool.query(
      'SELECT COUNT(*) as completed_games FROM games WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );
    
    const sessionsResult = await pool.query(
      'SELECT COUNT(*) as total_sessions FROM game_sessions WHERE user_id = $1',
      [userId]
    );

    const userResult = await pool.query(
      'SELECT join_date FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({
      totalGames: parseInt(gamesResult.rows[0].total_games) || 0,
      totalPlaytime: parseFloat(gamesResult.rows[0].total_playtime) || 0,
      blogCount: parseInt(blogsResult.rows[0].blog_count) || 0,
      completedGames: parseInt(completedResult.rows[0].completed_games) || 0,
      totalSessions: parseInt(sessionsResult.rows[0].total_sessions) || 0,
      memberSince: userResult.rows[0]?.join_date || new Date().toISOString()
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get gaming activity
app.get('/api/activity/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    const result = await pool.query(`
      SELECT 
        'game_added' as type,
        'Added ' || title || ' to library' as message,
        added_date as timestamp
      FROM games 
      WHERE user_id = $1
      UNION ALL
      SELECT 
        'playtime_logged' as type,
        'Logged ' || hours || 'h of gameplay' as message,
        session_date as timestamp
      FROM game_sessions 
      WHERE user_id = $1
      ORDER BY timestamp DESC
      LIMIT 50
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  if (page.startsWith('api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  const filePath = page.endsWith('.html') ? page : `${page}.html`;
  res.sendFile(path.join(__dirname, filePath), (err) => {
    if (err) {
      res.status(404).send(`
        <html>
          <head><title>GamePulse - Page Not Found</title></head>
          <body style="background: #0a0a0a; color: white; font-family: Arial; text-align: center; padding: 50px;">
            <h1>🎮 Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" style="color: #00ff88;">Return to GamePulse</a>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🎮 GamePulse Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view your app`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: PostgreSQL (Connected!)`);
});
