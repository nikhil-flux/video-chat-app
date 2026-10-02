# 🎥 Video Chat App

A real-time, peer-to-peer video chat application built with WebRTC and Socket.IO. Connect with multiple users simultaneously in private rooms with zero backend media costs. Fully containerized with Docker for instant deployment — no local dependencies required.

---

## ✨ Features

-   **Peer-to-Peer Video:** Direct WebRTC connections between users (no server-side media relay)
-   **Room-Based Calling:** Join any room by code; all users in the same room connect automatically
-   **Real-Time Signaling:** Instant connection setup via Socket.IO over WebSocket
-   **In-Room Text Chat:** Send and receive messages alongside video calls
-   **Media Controls:** Mute/unmute microphone, toggle camera on/off, end call
-   **User Identity:** Display names on video tiles for easy identification
-   **Responsive Grid Layout:** Auto-adjusting video grid for 2–10+ participants
-   **Zero Local Dependencies:** Docker handles all runtime requirements
-   **Free Global Access:** Deploy anywhere using Cloudflare Tunnels (no port forwarding)

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js 18, Express |
| Real-Time | Socket.IO (WebSocket signaling) |
| Media | WebRTC (P2P video/audio) |
| Containerization | Docker + Docker Compose |
| Remote Access | Cloudflare Tunnel (`cloudflared`) |
| Base Image | `node:18-alpine` (minimal footprint) |

---

## 🚀 Getting Started

### Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
-   [Cloudflared](https://github.com/cloudflare/cloudflared/releases) binary (for remote access only)
-   Modern browser with camera/microphone permissions (Chrome, Firefox, Edge, Safari)

> ⚠️ **No Node.js, npm, or Git installation needed locally.** Docker pulls the base image and installs all dependencies inside the container automatically.

### Step 1: Clone & Start with Docker Compose

```bash
git clone https://github.com/nikhil-flux/video-chat-app.git
cd video-chat-app
docker compose up --build -d
```

The container will:

	•	Build from  node:18-alpine 
	•	Install production dependencies via  npm ci 
	•	Bind to  0.0.0.0:3000  inside the container
	•	Map host port  3000  → container port  3000 
	•	Run a health check every 30s to verify responsiveness
	
Verify it’s healthy:
```bash
docker compose ps
# STATUS should show "(healthy)" after ~40s
```
Open http://localhost:3000 in your browser.

## 🌍 Remote Access via Cloudflare Tunnel

Share your app globally without opening firewall ports or configuring NAT.

### Step 1: Create an Tunnel
With the Docker container running, open a separate terminal and run:
```bash
cloudflared-windows-amd64.exe tunnel --url http://localhost:3000
```
you'll see output like:
```bash
Your quick tunnel has been created! Visit it at:
https://brave-panda-123.trycloudflare.com
```

### Step 2: Update the Socket Endpoint
Edit  app.js  line 2 and replace the localhost URL with your tunnel URL:
```javascript
// Before
const socket = io("http://localhost:3000");

// After
const socket = io("https://brave-panda-123.trycloudflare.com");
```
### Step 3: Rebuild & Share
```bash
docker compose up --build -d
```
Send the  trycloudflare.com  link to anyone. They can join from anywhere — no installation required on their end.

## How to Use
1.	Enter Room Code: Type any identifier (e.g.,  team-meeting ,  family-call ). All participants must use the exact same code.
2.	Enter Your Name: This appears on your video tile for others to identify you.
3.	Click “Join Room”: Grant camera and microphone permissions when prompted.
4.	Video Grid: Remote participants appear automatically in a responsive grid layout.
5.	Controls:
   
		•	Mute Mic / Unmute Mic – Toggle audio input
		•	Turn Off Camera / Turn On Camera – Toggle video input
		•	Open Chat / Close Chat – Show/hide the text chat panel
		•	End Call – Disconnect, stop media tracks, and return to join screen

## ⚡ Performance Tips

	  Scenario	                   Recommendation
	| Lag with 5+ users		     | Reduce resolution in app.js: video: { width: 240, height: 180 }
	| High bandwidth usage	     | Current default is 320×240 (~500–800 kbps/user); lower further if needed
	| Latency > 500ms		     | Ensure all users are on stable connections; P2P latency scales with network hops
	| Container slow startup	 | Health check start_period is set to 40s; increase if building on slow hardware
	| Memory pressure		     | Alpine base image uses ~85MB idle; monitor with docker stats video-chat-app
	| Tunnel disconnects		 | Ephemeral tunnels expire after inactivity; restart cloudflared or use a named tunnel

## 📁 Project Structure

	video-chat-app/
	├── docker-compose.yml      # Container orchestration, networking, healthcheck
	├── Dockerfile              # node:18-alpine build with production deps
	── .dockerignore            # Excludes node_modules, .git from build context
	├── server.js               # Express + Socket.IO signaling server
	├── app.js                  # WebRTC client logic + Socket.IO client
	├── index.html              # Main UI (join screen, video grid, chat)
	└── style.css               # Responsive grid layout & controls styling













