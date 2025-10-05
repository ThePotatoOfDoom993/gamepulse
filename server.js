const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve everything from root

// Simple data storage
let users = [
  {
    id: 1,
    email: "aterrealms@gmail.com",
    password: "minecraftplayer961400", 
    name: "Website Owner",
    role: "owner",
    joinDate: new Date().toISOString()
  },
  {
    id: 2,
    email: "demo@gamepulse.com",
    password: "demo123",
    name: "Demo User", 
    role: "gamer",
    joinDate: new Date().toISOString()
  }
];

let games = [];
let blogs = [];

// API Routes
app.get('/api/users', (req, res) => {
  res.json(users.map(({password, ...user}) => user));
});

app.post('/api/users/register', (req, res) => {
  const { email, password, name, role = 'gamer' } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: Date.now(),
    email,
    password,
    name,
    role,
    joinDate: new Date().toISOString()
  };
  
  users.push(newUser);
  res.json({ id: newUser.id, email, name, role });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.get('/api/games', (req, res) => {
  const userId = parseInt(req.query.user_id);
  const userGames = userId ? games.filter(game => game.user_id === userId) : games;
  res.json(userGames);
});

app.post('/api/games', (req, res) => {
  const { user_id, title, platform, genre, cover = '🎮' } = req.body;
  
  const newGame = {
    id: Date.now(),
    user_id,
    title,
    platform,
    genre,
    cover,
    status: 'backlog',
    playtime: 0,
    added_date: new Date().toISOString()
  };
  
  games.push(newGame);
  res.json(newGame);
});

app.post('/api/games/:id/playtime', (req, res) => {
  const gameId = parseInt(req.params.id);
  const { hours } = req.body;
  
  const game = games.find(g => g.id === gameId);
  if (game) {
    game.playtime += hours;
    game.status = 'playing';
    res.json({ message: 'Playtime logged successfully', game });
  } else {
    res.status(404).json({ error: 'Game not found' });
  }
});

app.get('/api/blogs', (req, res) => {
  res.json(blogs);
});

app.post('/api/blogs', (req, res) => {
  const { user_id, title, category, content } = req.body;
  
  const newBlog = {
    id: Date.now(),
    user_id,
    title,
    category,
    content,
    status: 'published',
    created_at: new Date().toISOString(),
    views: 0,
    likes: 0
  };
  
  blogs.push(newBlog);
  res.json(newBlog);
});

// Serve all HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  
  // Check if it's an API route
  if (page.startsWith('api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Serve HTML files
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
  console.log(`👤 Demo login: demo@gamepulse.com / demo123`);
});