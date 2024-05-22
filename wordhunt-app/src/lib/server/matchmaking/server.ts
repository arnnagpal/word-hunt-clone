import {useServer} from 'vite-sveltekit-node-ws';
import {Server} from 'socket.io';

const pools = new Set();

useServer((server) => {
    const io = new Server(server);

    io.of("matchmaking").on('connection', (socket) => {
        console.log('a user connected');
        pools.add(socket);

        socket.on('disconnect', () => {
            console.log('user disconnected');
            pools.delete(socket);
        });

        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });
    });
}, (path) => path.startsWith('/api/matchmaking'));