# Video Chat App

![CI/CD](https://github.com/nikhil-flux/video-chat-app/actions/workflows/ci.yml/badge.svg)

A browser-based video chat app built with Node.js, Express, Socket.IO and WebRTC. Join a room with a room code and your name, then talk over peer-to-peer video with a built-in text chat. It is packaged with Docker and has a GitHub Actions CI/CD pipeline that publishes the image to Docker Hub.

## Features

- Join a room with a room code and your name
- Peer-to-peer video and audio (WebRTC), with names shown on each video
- Mute / unmute microphone
- Turn camera on / off
- Room text chat panel (open and close)
- End Call button; when someone leaves or closes the tab, their video is removed for everyone else
- Mirrored (flipped) video view
- Responsive layout for phones and laptops

## Tech Stack

| Area | Tools |
|------|-------|
| Backend | Node.js, Express, Socket.IO, cors |
| Frontend | HTML, CSS, vanilla JavaScript, WebRTC |
| Signaling | Socket.IO (offer, answer and ICE exchange) |
| Containers | Docker (node:18-alpine), Docker Compose |
| CI/CD | GitHub Actions, Docker Hub |
| Remote access | Cloudflare Tunnel |

## How It Works

```
Browser A  <---- WebRTC video/audio (peer-to-peer) ---->  Browser B
      \                                                    /
       \------ Socket.IO signaling (Node.js server) ------/
```

The server only passes signaling messages and chat text between users in the same room. Video and audio travel directly between browsers.

## Prerequisites

Pick one way to run the app:

- **Docker** (easiest): Docker Desktop installed
- **Node.js**: Node.js 18 or newer and npm

You also need a browser with a camera and microphone (Chrome, Edge, Firefox or Safari).

To chat with friends on other networks you also need **cloudflared** (see "Chat with Friends Using Cloudflare Tunnel" below).

## Getting Started

### Option 1: Run with Docker

```bash
docker run -d -p 3000:3000 --name video-chat 857085/video-chat-app:latest
```

Open http://localhost:3000

Useful commands:

```bash
docker logs video-chat      # view logs
docker stop video-chat      # stop the app
docker rm -f video-chat     # remove the container
```

### Option 2: Run with Docker Compose

```bash
git clone https://github.com/nikhil-flux/video-chat-app.git
cd video-chat-app
docker compose up -d --build
```

Open http://localhost:3000. Stop it with `docker compose down`.

### Option 3: Run with Node.js

```bash
git clone https://github.com/nikhil-flux/video-chat-app.git
cd video-chat-app
npm install
node server.js
```

You should see `Server is running on port 3000!`. Open http://localhost:3000

## How to Use the App

1. Open the app in your browser.
2. Enter a **room code** (for example `party123`) and your **name**.
3. Click **Join Room** and allow camera and microphone access when the browser asks.
4. Share the same room code with your friends. When they join, their video appears in your grid.
5. Use the buttons at the top:

| Button | What it does |
|--------|--------------|
| Mute Mic | Turns your microphone off and on |
| Turn Off Camera | Turns your camera off and on |
| Open Chat | Opens the room chat panel |
| End Call | Leaves the room and returns to the join screen |

6. To chat, open the chat panel, type a message and press **Send** or the Enter key. Only people in the same room see it.

### Quick test on one computer

Open the app in two browser tabs, join the same room code with different names, and you should see both videos and be able to send chat messages between them. This needs no Cloudflare.

## Chat with Friends Using Cloudflare Tunnel

Your app runs on your own computer, so friends on other networks cannot reach `localhost:3000`. Cloudflare Tunnel gives your app a public `https` link that friends can open from anywhere. Browsers only allow camera and microphone on `localhost` or `https`, so the tunnel link also fixes camera permissions for your friends.

You only need Cloudflare to chat with people on other devices or networks. For testing on your own computer, `localhost` is enough.

### Step 1: Download cloudflared

**Windows**

- Using winget:
  ```bash
  winget install --id Cloudflare.cloudflared
  ```
- Or download `cloudflared-windows-amd64.exe` from the official page:
  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

**macOS**

```bash
brew install cloudflared
```

**Linux**

Download the package for your system from the same official page above.

Check that it works:

```bash
cloudflared --version
```

(If you downloaded the `.exe` file without installing it, run it from the folder where you saved it, for example `.\cloudflared-windows-amd64.exe --version`.)

### Step 2: Start the app

Start the app first, using any option from "Getting Started". It must be running on port 3000.

### Step 3: Start the tunnel

In a **second terminal**, run:

```bash
cloudflared tunnel --url http://localhost:3000
```

(With the downloaded file: `.\cloudflared-windows-amd64.exe tunnel --url http://localhost:3000`)

After a few seconds it prints a box like this:

```
Your quick Tunnel has been created! Visit it at:
https://something-random-words.trycloudflare.com
```

### Step 4: Connect the app to the Cloudflare URL

Open `app.js` and look at the socket line near the top.

**Recommended: no URL needed.** Use:

```javascript
const socket = io();
```

The page connects to whatever address it was opened from, so it works on `localhost`, in Docker and through any tunnel link, with no editing.

**If your copy has a hardcoded URL**, for example:

```javascript
const socket = io("https://old-link.trycloudflare.com");
```

replace it with your new tunnel link:

```javascript
const socket = io("https://something-random-words.trycloudflare.com");
```

Then restart the app (`node server.js`), or rebuild and re-run the Docker image, because the file is copied into the image. You will have to repeat this every time the tunnel link changes, which is why `io()` is better.

### Step 5: Share and chat

1. Send your friends the tunnel link (`https://...trycloudflare.com`) and a room code.
2. Everyone opens the link, enters the same room code and their name, and clicks **Join Room**.

### Notes

- The link changes every time you restart the tunnel. Keep the app and the tunnel running while people are connected.
- Quick tunnels have no uptime guarantee and are meant for testing and demos.
- Open the tunnel link, not your computer's IP address, or the browser will block the camera.

## Configuration

| Setting | Default | How to change |
|---------|---------|---------------|
| Port | 3000 | Set the `PORT` environment variable, for example `PORT=4000 node server.js` |

If you change the port when using Docker, change the port mapping too, for example `-p 4000:3000`, and point the tunnel at the same port.

## CI/CD Pipeline

The pipeline is defined in `.github/workflows/ci.yml`.

| When | What happens |
|------|--------------|
| Push or pull request to `main` | **test** job: install dependencies, syntax check, build the Docker image, run it and check it responds |
| Push to `main` (after tests pass) | **publish** job: log in to Docker Hub and push `857085/video-chat-app` with the `latest` tag and a tag for the commit SHA |

Docker Hub credentials are stored as GitHub Actions secrets named `DOCKER_USERNAME` and `DOCKER_PASSWORD`. To use the pipeline on your own fork, add both secrets in your repository under Settings, Secrets and variables, Actions.

## Project Structure

```
.
├── app.js                   # Client: WebRTC, chat, controls
├── server.js                # Express + Socket.IO signaling server
├── index.html               # Join screen, video grid, chat panel
├── style.css                # Styling and responsive layout
├── Dockerfile               # node:18-alpine image with a healthcheck
├── docker-compose.yml       # Container setup
└── .github/workflows/ci.yml # CI/CD pipeline
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 is already in use | Stop the other app, or run on another port, for example `-p 3001:3000` |
| Container name `video-chat` already exists | Run `docker rm -f video-chat` and start it again |
| `cloudflared` is not recognized | Install it (Step 1) or run the downloaded `.exe` from its folder |
| Camera or microphone does not work | Allow permissions in the browser. Use `localhost` or the `https` tunnel link |
| Page loads but joining a room does nothing | `app.js` is pointing at a wrong or old URL. Use `io()` or update the URL (Step 4) |
| Joined but no other video appears | Make sure everyone typed exactly the same room code |
| Video works on one network but not another | The app has no TURN server, so some networks block direct connections (see Known Limitations) |
| Tunnel link stopped working | Restart the tunnel and share the new link |

## Known Limitations

- Uses only a STUN server (no TURN server), so calls can fail between some networks, such as mobile data and some home routers.
- No authentication: anyone with the room code can join.
- No automated tests beyond the syntax check and the container smoke test.

## Roadmap

- [ ] Add a TURN server for reliable cross-network calls
- [ ] Participants list panel
- [ ] Automated tests in CI
- [ ] Kubernetes manifests

## Author

Nikhil ([@nikhil-flux](https://github.com/nikhil-flux))