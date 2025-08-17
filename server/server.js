// Periodically log memory and CPU usage
setInterval(() => {
  const usage = process.memoryUsage();
  const cpu = process.cpuUsage();
  console.log(`[MEMORY] RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB, Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[CPU] User: ${(cpu.user / 1000).toFixed(2)} ms, System: ${(cpu.system / 1000).toFixed(2)} ms`);
  console.log(`Rooms: ${Object.keys(rooms).length}`);
}, 10000); // every 10 seconds

import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });
const rooms = {}; // { roomId: Set of ws }

console.log(`Signaling server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  let room = null;
  console.log('New client connected');

  ws.on('message', (msg) => {
    console.log(`Received message: ${msg}`);
    const data = JSON.parse(msg);

    if (data.type === 'join') {
      room = data.room;
      if (!rooms[room]) rooms[room] = new Set();
      const isFirst = rooms[room].size === 0;
      rooms[room].add(ws);
      console.log(`Client joined room ${room}. Total clients in room: ${rooms[room].size}`);
      if (!isFirst) {
        // Notify only the existing clients (no  t the new one)
        rooms[room].forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(JSON.stringify({ type: 'join', room }));
          }
        });
      }
    } else if (room) {
      // Broadcast signaling messages to other clients in the room
      rooms[room].forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(msg);
        }
      });
      console.log(`Broadcasted message of type "${data.type}" to room "${room}" (${rooms[room].size - 1} clients)`);
    }
  });

  ws.on('close', () => {
    if (room && rooms[room]) {
      rooms[room].delete(ws);
      console.log(`Client disconnected from room ${room}. Remaining: ${rooms[room].size}`);
      if (rooms[room].size === 0) {
        delete rooms[room];
        console.log(`Room ${room} deleted (empty)`);
      }
    } else {
      console.log('Client disconnected (no room)');
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});
