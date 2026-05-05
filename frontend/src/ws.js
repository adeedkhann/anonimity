import {io} from 'socket.io-client'

export function connectWs (){
   const host = window.location.hostname; 
  return io(`http://${host}:3000`);
}