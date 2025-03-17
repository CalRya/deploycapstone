const express = require('express');
const cors = require('cors');
const app = express();

const ConnectToDatabase = require('../config/DBHandler');

const UserRoute = require('../routes/User.routes');
const AccountRoute = require('../routes/Account.routes');
const TransactionRoute = require('../routes/Transaction.routes');
const DeveloperRoute = require('../routes/Developer.routes');

const DeveloperMiddleware = require('../middleware/Developer.middleware');

// ✅ CORS Configuration (Explicitly Allowing PATCH)
app.use(cors({
    origin: 'https://pageturnerdeploy.vercel.app',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ✅ Handle Preflight Requests Manually
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://pageturnerdeploy.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);
});

// ✅ Ensure JSON Parsing
app.use(express.json());

ConnectToDatabase();

app.get('/', DeveloperMiddleware.CheckDeveloperTokenValid, (req, res) => {
    res.json({
        message: `This is Home`
    });
});

app.use('/api', UserRoute);
app.use('/api', AccountRoute);
app.use('/api', TransactionRoute);
app.use('/api', DeveloperRoute);

module.exports = app;
