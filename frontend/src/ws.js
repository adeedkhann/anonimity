import { io } from 'socket.io-client';

export function connectWs() {
  // If we are on localhost, connect to the local port 3000.
  // If we are on Render, connect to the main URL without a port number.
  const URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:10000' 
    : 'https://anonimity.onrender.com';

  return io(URL, {
    transports: ['websocket'], // Highly recommended for Render to avoid polling errors
  });
}