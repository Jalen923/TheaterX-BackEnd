import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';  // Importing the cors package
import resolvers from './resolvers';

// Read the schema from the schema.graphql file
const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');

// Initialize Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// App setup
const app = express();

// Use CORS middleware
app.use(cors({
    origin: '*', // Or use * to allow all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Start Apollo Server and apply it as middleware to the Express app
const startServer = async () => {
    await server.start();
    server.applyMiddleware({ app });
    
    // Start the Express app
    app.listen({ port: 4000, host: '0.0.0.0' }, () => {
        console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
    });
};

startServer();