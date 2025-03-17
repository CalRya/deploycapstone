const express = require('express');
const cors = require('cors');
const app = express();

const ConnectToDatabase = require('../config/DBHandler');

const UserRoute = require('../routes/User.routes');
const AccountRoute = require('../routes/Account.routes');
const TransactionRoute = require('../routes/Transaction.routes');
const DeveloperRoute = require('../routes/Developer.routes');

const DeveloperMiddleware = require('../middleware/Developer.middleware');

// ✅ Improved CORS configuration
const corsOptions = {
    origin: 'https://pageturnerdeploy.vercel.app',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOptions.origin);
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content
    }
    next();
});

ConnectToDatabase();

app.use(express.json());

app.get('/', DeveloperMiddleware.CheckDeveloperTokenValid, (req, res) => {
    res.json({ message: 'This is Home' });
});

// ✅ Organized routes
app.use('/api', UserRoute);
app.use('/api', AccountRoute);
app.use('/api', TransactionRoute);
app.use('/api', DeveloperRoute);

module.exports = app;