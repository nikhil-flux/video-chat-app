// IMPORTANT: For testing on your own laptop, leave this as "http://localhost:3000"
// When we put it on the internet later, we will change this line!
const socket = io(); 

const joinScreen = document.getElementById('join-screen');
const videoChat = document.getElementById('video-chat');
const joinBtn = document.getElementById('join-btn');
const roomInput = document.getElementById('room-input');
const nameInput = document.getElementById('name-input');
const videoGrid = document.getElementById('video-grid');
const localVideo = document.getElementById('local-video');
const localNameDisplay = document.getElementById('local-name');
const chatSection = document.getElementById('chat-section');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const closeChatBtn = document.getElementById('close-chat-btn');

let localStream;
let roomId;
let userName;
const peers = {};
const userNames = {};

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

async function initLocalMedia() {
    try {
        // Low resolution to save computer power for 10 users
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 320, height: 240 }, 
            audio: true 
        });
        localVideo.srcObject = localStream;
    } catch (err) {
        alert("Please allow camera and microphone access in your browser!");
    }
}

function createPeerConnection(targetUserId) {
    const peer = new RTCPeerConnection(configuration);
    
    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    });

    peer.ontrack = (event) => {
        let videoContainer = document.getElementById(`container-${targetUserId}`);
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            videoContainer.id = `container-${targetUserId}`;
            
            const remoteVideo = document.createElement('video');
            remoteVideo.id = `video-${targetUserId}`;
            remoteVideo.autoplay = true;
            remoteVideo.playsinline = true;
            
            const nameDisplay = document.createElement('div');
            nameDisplay.id = `name-${targetUserId}`;
            nameDisplay.className = 'video-name';
            nameDisplay.textContent = userNames[targetUserId] || 'User';
            
            videoContainer.appendChild(remoteVideo);
            videoContainer.appendChild(nameDisplay);
            videoGrid.appendChild(videoContainer);
        }
        const remoteVideo = document.getElementById(`video-${targetUserId}`);
        remoteVideo.srcObject = event.streams[0];
    };

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', {
                roomId: roomId,
                type: 'ice-candidate',
                target: targetUserId,
                payload: event.candidate
            });
        }
    };
    peers[targetUserId] = peer;
    return peer;
}

socket.on('user-connected', async (data) => {
    const userId = data.userId;
    const name = data.userName;
    
    userNames[userId] = name;
    
    const peer = createPeerConnection(userId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('signal', { roomId: roomId, type: 'offer', target: userId, payload: offer });
});

socket.on('user-left', (userId) => {
    // Close the peer connection
    if (peers[userId]) {
        peers[userId].close();
        delete peers[userId];
    }
    // Remove the remote video container
    const videoContainer = document.getElementById(`container-${userId}`);
    if (videoContainer) {
        videoContainer.remove();
    }
    delete userNames[userId];
});

socket.on('signal', async (data) => {
    const { sender, type, payload } = data;
    if (data.target && data.target !== socket.id) return;

    let peer = peers[sender];
    if (!peer) peer = createPeerConnection(sender);

    if (type === 'offer') {
        await peer.setRemoteDescription(payload);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('signal', { roomId: roomId, type: 'answer', target: sender, payload: answer });
    } else if (type === 'answer') {
        await peer.setRemoteDescription(payload);
    } else if (type === 'ice-candidate') {
        await peer.addIceCandidate(payload);
    }
});

// Chat functionality
socket.on('receive-message', (data) => {
    displayMessage(data.message, data.senderName, false);
});

function displayMessage(message, sender, isOwn) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message ' + (isOwn ? 'own' : 'other');
    
    const senderEl = document.createElement('div');
    senderEl.className = 'message-sender';
    senderEl.textContent = sender;
    
    messageEl.appendChild(senderEl);
    
    const textEl = document.createElement('div');
    textEl.textContent = message;
    messageEl.appendChild(textEl);
    
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendBtn.onclick = () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('send-message', { 
            roomId: roomId, 
            message: message,
            senderName: userName
        });
        displayMessage(message, userName, true);
        messageInput.value = '';
    }
};

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

chatToggleBtn.onclick = () => {
    if (chatSection.style.display === 'none') {
        chatSection.style.display = 'flex';
        chatToggleBtn.textContent = 'Close Chat';
    } else {
        chatSection.style.display = 'none';
        chatToggleBtn.textContent = 'Open Chat';
    }
};

closeChatBtn.onclick = () => {
    chatSection.style.display = 'none';
    chatToggleBtn.textContent = 'Open Chat';
};

document.getElementById('mute-btn').onclick = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    document.getElementById('mute-btn').innerText = audioTrack.enabled ? 'Mute Mic' : 'Unmute Mic';
};

document.getElementById('video-btn').onclick = () => {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    document.getElementById('video-btn').innerText = videoTrack.enabled ? 'Turn Off Camera' : 'Turn On Camera';
};

document.getElementById('end-call-btn').onclick = () => {
    // Close all peer connections
    Object.values(peers).forEach(peer => peer.close());
    
    // Stop all media tracks
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    // Remove all remote video elements
    const videoContainers = videoGrid.querySelectorAll('.video-container:not(#local-container)');
    videoContainers.forEach(container => container.remove());
    
    // Notify others in the room that you're leaving
    socket.emit('user-disconnected', roomId);
    
    // Leave the room
    socket.off();
    
    // Reset and go back to join screen
    joinScreen.style.display = 'flex';
    videoChat.style.display = 'none';
    chatSection.style.display = 'none';
    roomId = null;
    userName = null;
};

joinBtn.onclick = async () => {
    roomId = roomInput.value.trim();
    userName = nameInput.value.trim();
    
    if (!roomId) return alert("Enter a room code!");
    if (!userName) return alert("Enter your name!");
    
    await initLocalMedia();
    
    // Wrap local video in container
    const localContainer = document.createElement('div');
    localContainer.className = 'video-container';
    localContainer.id = 'local-container';
    localVideo.parentNode.insertBefore(localContainer, localVideo);
    localContainer.appendChild(localVideo);
    localNameDisplay.textContent = userName;
    
    joinScreen.style.display = 'none';
    videoChat.style.display = 'block';
    messagesDiv.innerHTML = '';
    socket.emit('join-room', { roomId: roomId, userName: userName });
};