// server.js

require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const morgan = require('morgan');

// Initialize Express App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Update with your frontend URL in production
    methods: ['GET', 'POST']
  }
});


const allowedOrigins = ['http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Initialize Sequelize
const sequelize = new Sequelize(process.env.MYSQL_URI || 'mysql://root:12345@localhost:3306/mindconnect', {
  dialect: 'mysql',
  logging: false,
});

// Define Models

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'users',
  timestamps: false,
});

const JournalEntry = sequelize.define('JournalEntry', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  mood: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
}, {
  tableName: 'journal_entries',
  timestamps: false,
});

// Sync Models
sequelize.sync()
  .then(() => console.log('MySQL Connected and Models Synced'))
  .catch(err => console.log('Error connecting to MySQL:', err));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Access Token' });
    req.user = user;
    next();
  });
};

// Routes

// Register Route
app.post('/api/register',
  [
    // Validation
    require('express-validator').body('email').isEmail(),
    require('express-validator').body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const { email, password } = req.body;

    // Check for validation errors
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    try {
      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({ email, password: hashedPassword });

      // Create JWT
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Login Route
app.post('/api/login',
  [
    // Validation
    require('express-validator').body('email').isEmail(),
    require('express-validator').body('password').exists()
  ],
  async (req, res) => {
    const { email, password } = req.body;

    // Check for validation errors
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    try {
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

      // Create JWT
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Get User Info Route
app.get('/api/user', authenticateToken, async (req, res) => {
  res.json({ user: { email: req.user.email } });
});

// Journaling Routes

// Get Journal Entries
app.get('/api/journals', authenticateToken, async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { userId: req.user.id },
      order: [['timestamp', 'DESC']],
    });
    res.json({ entries });
  } catch (error) {
    console.error('Fetch Journals Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Journal Entry
app.post('/api/journals', authenticateToken, async (req, res) => {
  const { text, mood } = req.body;

  if (!text || !mood) {
    return res.status(400).json({ message: 'Text and mood are required' });
  }

  try {
    await JournalEntry.create({
      userId: req.user.id,
      text,
      mood,
    });
    res.json({ message: 'Entry saved successfully' });
  } catch (error) {
    console.error('Add Journal Entry Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve HTML Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chat.html'));
});

app.get('/journal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/journal.html'));
});

app.get('/library', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/library.html'));
});

// Socket.io for Chat
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(new Error("Authentication error"));
    }
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.email}`);

  socket.on('chatMessage', (msg) => {
    const message = { user: socket.user.email, text: msg.text };
    io.emit('message', message); // Broadcast to all connected clients
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.email}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
