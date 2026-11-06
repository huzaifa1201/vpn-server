# 🚀 High-Speed VPN & WebSocket Proxy Backend

A production-ready Node.js backend for modern cross-platform VPN applications. Designed to be deployed on **Render.com**, **Railway**, or any standard cloud host with zero VPS required.

## 🌟 Features
- **REST API Endpoints:** Dynamic server list, ping latency, and server load monitoring.
- **HTTP CONNECT Tunneling:** Full HTTPS proxying and packet relay on standard web ports (80/443).
- **WebSocket (WSS) Tunneling:** Streams raw TCP/TLS traffic over WebSockets to bypass firewalls and DPI.
- **Zero-VPS Required:** Deployable on Render.com free web service tier.

## 📡 API Endpoints
- `GET /` - Health check & tunnel availability status.
- `GET /api/v1/servers` - Active global VPN nodes (Mumbai, Singapore, Frankfurt, Oregon, Tokyo).
- `POST /api/v1/connect` - Assigns internal virtual IP slot and returns tunnel parameters.
- `CONNECT host:port` - Standard HTTP CONNECT tunnel handler.
- `WS /tunnel` - Real-time WebSocket TCP tunnel.

## 🚀 1-Click Render.com Deployment
1. Create a free account on [Render.com](https://render.com).
2. Click **New Web Service** and select this GitHub repository.
3. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
4. Deploy! Render will provide your public HTTPS URL (e.g., `https://your-service.onrender.com`).
