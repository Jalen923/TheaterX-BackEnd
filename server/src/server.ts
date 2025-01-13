import https from 'https';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import resolvers from './resolvers';

const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');

// Initialize Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const app = express();

const allowedOrigins = [
    'https://theaterxapp.com', 
    'https://www.theaterxapp.com', 
    'https://api.theaterxapp.com', 
    'https://www.api.theaterxapp.com',
    'https://studio.apollographql.com'
];

// Use CORS middleware with correct configuration
app.use(cors({
    origin: (origin, callback) => {
        //console.log('Origin:', origin); // Debug log to see the origin
        // Ensure 'origin' is a string before calling 'includes'
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            //console.error(`Blocked by CORS: ${origin}`); // Log blocked origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // If cookies or credentials are needed
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', (req, res) => {
    const origin = req.headers.origin;
    // Ensure 'origin' is a string before checking against allowedOrigins
    if (typeof origin === 'string' && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204); // No Content
});

// HTTPS server setup
const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/theaterxapp.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/theaterxapp.com/fullchain.pem'),
};

// Start Apollo Server and apply it as middleware to the Express app
const startServer = async () => {
    await server.start();
    server.applyMiddleware({ app });

    https.createServer(httpsOptions, app).listen(4000, '127.0.0.1', () => {
        console.log('Backend running at https://127.0.0.1:4000/graphql');
    });
};

startServer();