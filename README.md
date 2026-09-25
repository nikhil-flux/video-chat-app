# 🎥 Video Chat App

A free, real-time video chat application built with WebRTC and Socket.IO. Connect with up to 10+ people simultaneously without any backend costs!

---

## ✨ Features

- ✅ **Peer-to-Peer Video Streaming** - Direct connection between users (no server overhead)
- ✅ **Real-Time Signaling** - Instant connection setup via Socket.IO
- ✅ **Room-Based Calling** - Join the same room to video chat
- ✅ **Mute/Unmute Audio** - Control your microphone
- ✅ **Camera On/Off** - Toggle your video feed
- ✅ **Low Bandwidth** - Optimized for 10+ simultaneous users
- ✅ **Mobile Friendly** - Works on phones, tablets, and desktops
- ✅ **Free Deployment** - Use Cloudflare Tunnel for free remote access

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Real-Time Communication:** Socket.IO
- **Video Streaming:** WebRTC
- **Signaling Server:** Express + Socket.IO
- **Remote Access:** Cloudflare Tunnel (Free)

---

## 📋 Requirements

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Git** (for cloning) - [Download](https://git-scm.com/)
- **Cloudflared** (for remote access) - [Download](https://github.com/cloudflare/cloudflared/releases)
- **Modern Web Browser** (Chrome, Firefox, Edge, Safari)

---

## 🚀 Quick Start

### **1. Clone the Repository**

    git clone https://github.com/nikhil-flux/video-chat-app.git
    cd video-chat-app

### **2. Install Dependencies**
      
    npm install

## 🌍 Remote Access (Share Worldwide)

Install Cloudflared

    Download from: https://github.com/cloudflare/cloudflared/releases

Run Both in Separate Windows

  Window 1: Start Node Server

    node server.js

  you'll see "Server is running"

  Window 2: Create Tunnel

    cloudflared-windows-amd64.exe tunnel --url http://localhost:3000

  you'll see "Your quick tunnel has been created! Visit it at: 
  https://brave-panda-123.trycloudflare.com"

**Update app.js**
Replace this line:
                    
    const socket = io("http://10.138.136.180:3000");
    
With your tunnel URL:

    const socket = io("https://brave-panda-123.trycloudflare.com");

**Share the URL**

  Send friends this link 

      https://brave-panda-123.trycloudflare.com

  They can join from anywhere! 🌍


  ## 📁 Project Structure

    video-chat-app/
          ├── index.html          # Frontend HTML
          ├── app.js              # Frontend JavaScript (WebRTC & Socket.IO)
          ├── style.css           # Styling
          ├── server.js           # Backend Node.js server
          ├── package.json        # Dependencies
          ├── package-lock.json   # Lock file
          └── README.md           # This file

  ## 🎮 How to Use

	1.	Enter Room Code: Pick any room name (e.g., "party123")
	2.	Click Join: Both users must use the same room code
	3.	Allow Permissions: Browser asks for camera/microphone access
	4.	See Video: All connected users appear in a grid
	5.	Mute/Camera: Use buttons to control your audio/video

## 📊 Performance Tips

	•	Max Users: Tested with 10+ simultaneous users
	•	Video Quality: Low resolution (320x240) optimized for bandwidth
	•	Latency: < 100ms for same WiFi, < 500ms for internet
	•	Bandwidth: ~500-800 kbps per user

If It Lags

Reduce video resolution in app.js:

      video: { width: 240, height: 180 }  // Lower resolution


## 🚀 Future Features

	☐︎	Screen sharing
	☐︎	Chat messages
	☐︎	Recording video calls
	☐︎	User profiles
	☐︎	Better UI/UX
	☐︎	Mobile app (React Native)
	☐︎	Persistent rooms (database)
	☐︎	User authentication
    

  







