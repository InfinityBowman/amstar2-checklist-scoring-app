import WebSocket from 'ws';

const SERVER_URL = 'ws://localhost:3000';
const NUM_CLIENTS = 1000;
const CLOSE_CLIENT_TIME = 10000;
const ROOM_PREFIX = 'testroom';

let connected = 0;
let received = 0;
const clients = [];

function logStatus() {
  console.log(`Connected: ${connected}/${NUM_CLIENTS}, Messages received: ${received}`);
}

for (let i = 0; i < NUM_CLIENTS; i++) {
  // Assign two clients per room: room0, room1, room2, ...
  const room = `${ROOM_PREFIX}${Math.floor(i / 2)}`;
  const ws = new WebSocket(SERVER_URL);

  ws.on('open', () => {
    connected++;
    ws.send(JSON.stringify({ type: 'join', room }));
    logStatus();

    // Send a test message after joining
    setTimeout(() => {
      ws.send(JSON.stringify({ type: 'test', from: i, room }));
    }, 1000 + Math.random() * 2000);
  });

  ws.on('message', (msg) => {
    received++;
    console.log(`[Client ${i}] Received: ${msg}`);
    logStatus();
  });

  ws.on('close', () => {
    console.log(`[Client ${i}] Connection closed`);
  });

  ws.on('error', (err) => {
    console.error(`[Client ${i}] Error:`, err);
  });

  clients.push(ws);
}

// Optional: Close all clients after 10 seconds
setTimeout(() => {
  clients.forEach((ws) => ws.close());
  console.log('All clients closed.');
}, CLOSE_CLIENT_TIME);
