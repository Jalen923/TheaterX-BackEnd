import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import resolvers from './resolvers'

// Read the schema from the schema.graphql file
const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');

// Initialize Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

//app 
const app = express();

// Start Apollo Server and apply it as middleware to the Express app
const startServer = async () => {
    await server.start();
    server.applyMiddleware({ app });
    
    // Start the Express app
    app.listen({ port: 4000, host: '0.0.0.0'  }, () => {
        console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
    });
};

startServer();