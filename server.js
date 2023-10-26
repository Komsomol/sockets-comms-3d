import express from 'express';
import http from 'http';

import { WebSocketServer } from "ws";
const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const receivedMessage = message.toString();
        console.log('Received:', receivedMessage);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(receivedMessage);
            }
        });
    });

    ws.send('Connection established!');
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
