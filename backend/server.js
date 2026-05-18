// Loaded Atlas Database String
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');

// 1. Load Environment Variables from root .env
dotenv.config({ path: '../.env' }); // try parent if running inside backend
if (!process.env.PORT) {
  dotenv.config(); // fallback to current working directory
}

// 2. Initialize Express application
const app = express();

// 3. Connect to Database (Auto-provisions In-Memory MongoDB if MONGODB_URI is blank)
connectDB();

// 4. Register Standard Middlewares
app.use(cors());
app.use(express.json());

// 5. Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 6. Root Route placeholder for easy diagnostics
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AI-Based Employee Performance Analytics API',
    status: 'Running',
    database: process.env.MONGODB_URI ? 'Cloud Atlas' : 'In-Memory DB Engine'
  });
});

// 7. Mount Central Error Handling Middleware (must be registered after routes)
app.use(errorHandler);

// 8. Bind Server and Start Listening
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`👉 API endpoint is live at: http://localhost:${PORT}`);
});

// Graceful shutdown handling for tests or reloads
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
