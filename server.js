/**
 * Production-Ready Hybrid VPN API & WebSocket Tunneling Server
 * Compatible with Render.com, Railway, and Cloud PaaS (Zero VPS Required!)
 * 
 * Features:
 * 1. REST API: Server list, status, ping metrics
 * 2. HTTP CONNECT Tunneling: Allows standard proxy connections on port 80/443
 * 3. WebSocket (WSS) Tunneling: Streams raw TCP traffic to any website (bypasses firewalls)
 */

const express = require('express');
const http = require('http');
const net = require('net');
const url = require('url');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🌐 Server nodes list (Render automatically acts as the exit node)
const SERVERS = [
    {
        id: "node-render-fast",
        name: "Cloud Edge (Render High-Speed Node)",
        country_code: "US",
        flag: "🌐",
        city: "Oregon / Frankfurt",
        endpoint: "render-tunnel-active",
        ping_ms: 38,
        speed_mbps: 500.0,
        load_percent: 22,
        is_vip: false
    },
    {
        id: "node-in-mumbai",
        name: "India (Mumbai Subsea Node)",
        country_code: "IN",
        flag: "🇮🇳",
        city: "Mumbai",
        endpoint: "139.59.20.15:51820",
        ping_ms: 45,
        speed_mbps: 350.0,
        load_percent: 30,
        is_vip: false
    },
    {
        id: "node-sg-singapore",
        name: "Singapore (Gaming Route)",
        country_code: "SG",
        flag: "🇸🇬",
        city: "Jurong",
        endpoint: "192.0.2.88:51820",
        ping_ms: 65,
        speed_mbps: 450.0,
        load_percent: 35,
        is_vip: false
    }
];

// 1. Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: "online",
        service: "Render Hybrid VPN & WebSocket Proxy Server",
        protocol: "HTTP/1.1 + WebSocket (WSS)",
        tunnel_available: true
    });
});

// 2. REST API: Available servers list
app.get('/api/v1/servers', (req, res) => {
    res.json({
        status: "success",
        total: SERVERS.length,
        servers: SERVERS
    });
});

// 3. REST API: Connection details
app.post('/api/v1/connect', (req, res) => {
    const { user_id, server_id } = req.body;
    const server = SERVERS.find(s => s.id === server_id) || SERVERS[0];

    res.json({
        status: "success",
        message: `Connected via ${server.name}`,
        data: {
            server_id: server.id,
            server_name: server.name,
            flag: server.flag,
            ping_ms: server.ping_ms,
            speed_mbps: server.speed_mbps,
            assigned_ip: "10.8.0.1",
            tunnel_type: "WEBSOCKET_PROXY",
            ws_endpoint: "/tunnel"
        }
    });
});

// Create Base HTTP Server
const server = http.createServer(app);

// ==============================================================================
// 🚀 FEATURE 1: HTTP CONNECT PROXY (Standard HTTPS Tunneling on Render)
// ==============================================================================
server.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = url.parse(`//${req.url}`, false, true);
    const targetPort = port || 443;

    console.log(`[*] [HTTP CONNECT TUNNEL] Routing request to: ${hostname}:${targetPort}`);

    // Remote server (Google, YouTube, blocked website) se TCP connection banana
    const serverSocket = net.connect(targetPort, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err) => {
        clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        clientSocket.end();
    });

    clientSocket.on('error', () => {
        serverSocket.end();
    });
});

// ==============================================================================
// 🚀 FEATURE 2: WEBSOCKET TCP TUNNEL (Bypasses all Firewalls on Port 443)
// ==============================================================================
const wss = new WebSocket.Server({ server, path: '/tunnel' });

wss.on('connection', (ws) => {
    console.log('[+] [WS TUNNEL] Naya mobile client WebSocket tunnel se connect ho gaya!');
    let remoteSocket = null;

    ws.on('message', (message) => {
        try {
            // Check if first message is a JSON connection command
            if (!remoteSocket) {
                const initData = JSON.parse(message.toString());
                if (initData.action === 'connect') {
                    const host = initData.host;
                    const port = initData.port || 443;

                    console.log(`[*] [WS TUNNEL] Opening target socket: ${host}:${port}`);
                    remoteSocket = net.connect(port, host, () => {
                        ws.send(JSON.stringify({ status: "connected", host, port }));
                    });

                    // Forward incoming data from the remote website to WebSocket client
                    remoteSocket.on('data', (chunk) => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(chunk);
                        }
                    });

                    remoteSocket.on('error', (err) => {
                        ws.send(JSON.stringify({ error: err.message }));
                        ws.close();
                    });

                    remoteSocket.on('close', () => {
                        ws.close();
                    });
                    return;
                }
            }

            // Forward data from mobile to target website
            if (remoteSocket && remoteSocket.writable) {
                remoteSocket.write(message);
            }
        } catch (e) {
            // Binary stream data
            if (remoteSocket && remoteSocket.writable) {
                remoteSocket.write(message);
            }
        }
    });

    ws.on('close', () => {
        if (remoteSocket) {
            remoteSocket.destroy();
        }
        console.log('[-] [WS TUNNEL] Client disconnected.');
    });
});

server.listen(PORT, () => {
    console.log(`==================================================================`);
    console.log(`🚀 RENDER-COMPATIBLE HYBRID VPN & PROXY SERVER ACTIVE!`);
    console.log(`📡 HTTP & REST API     : http://localhost:${PORT}`);
    console.log(`🔒 HTTP CONNECT Tunnel : localhost:${PORT} (Direct HTTPS Proxy)`);
    console.log(`⚡ WebSocket Tunnel    : ws://localhost:${PORT}/tunnel`);
    console.log(`==================================================================`);
});
