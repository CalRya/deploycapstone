const express = require('express');
const cors = require('cors');
const app = express();

const ConnectToDatabase = require('../config/DBHandler');

const UserRoute = require('../routes/User.routes');
const AccountRoute = require('../routes/Account.routes');
const TransactionRoute = require('../routes/Transaction.routes');
const DeveloperRoute = require('../routes/Developer.routes');

const DeveloperMiddleware = require('../middleware/Developer.middleware');

// 🔥 Configure CORS properly
app.use(cors({
    origin: 'https://pageturnerdeploy.vercel.app',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], // Ensure PATCH is included
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// 🔥 Handle CORS manually for preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://pageturnerdeploy.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204); // No Content response for preflight
});

// Connect to database
ConnectToDatabase();

// Middleware to parse JSON
app.use(express.json());

// Default home route
app.get('/', DeveloperMiddleware.CheckDeveloperTokenValid, (req, res) => {
    res.json({ message: `This is Home` });
});

// Register routes
app.use('/api', UserRoute);
app.use('/api', AccountRoute);
app.use('/api', TransactionRoute);
app.use('/api', DeveloperRoute);

module.exports = app;
