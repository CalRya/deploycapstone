const express = require('express');
const cors = require('cors');
const app = express();

const ConnectToDatabase = require('../config/DBHandler');

const UserRoute = require('../routes/User.routes');
const AccountRoute = require('../routes/Account.routes');
const TransactionRoute = require('../routes/Transaction.routes');
const DeveloperRoute = require('../routes/Developer.routes');

const DeveloperMiddleware = require('../middleware/Developer.middleware');

// ✅ Ensure CORS headers allow PATCH and PUT
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://pageturnerdeploy.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    
    next();
});

ConnectToDatabase();

app.use(express.json());

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
