require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./server/routes/auth');
const dashboardRoutes = require('./server/routes/dashboard');
const authMiddleware = require('./server/middleware/authMiddleware');

const app = express();

// MongoDB Connection
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production' // set to true if using HTTPS
    }
}));

// Set EJS as the template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Layout settings
app.set('layout', 'layouts/main');

// Routes
app.use('/', authRoutes);  // Public routes (login, signup, etc.)
app.use('/dashboard', dashboardRoutes);  // Dashboard routes, already protected by middleware

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set the port from the environment or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});