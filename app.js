require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import routes and middleware
const authRoutes = require('./server/routes/auth');
const dashboardRoutes = require('./server/routes/dashboard');
const adminRoutes = require('./server/routes/adminRoutes');
const authMiddleware = require('./server/middleware/authMiddleware');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Middleware
app.use(express.urlencoded({ extended: true }));  // To parse form data
app.use(express.json());  // To parse JSON bodies
app.use(cookieParser());  // Parse cookies

// Session Middleware with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        httpOnly: true,
        secure: false,   // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24  // 1 day
    }
}));

// Set EJS as the template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Layout settings
app.set('layout', 'layouts/main');

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRoutes);  // Public routes (login, signup, etc.)
app.use('/dashboard', authMiddleware.isAuthenticated, dashboardRoutes);  // Dashboard routes (protected)
app.use('/admin', authMiddleware.isAuthenticated, authMiddleware.isAdmin, adminRoutes);  // Admin routes (protected)

// Set the port from the environment or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});