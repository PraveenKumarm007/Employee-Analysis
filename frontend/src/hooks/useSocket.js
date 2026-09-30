import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export const useSocket = (onDataChanged) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('dataChanged', (data) => {
      console.log('Data changed event received:', data);
      if (onDataChanged) {
        onDataChanged(data);
      }
    });

    return () => newSocket.disconnect();
  }, [onDataChanged]);

  return socket;
};
