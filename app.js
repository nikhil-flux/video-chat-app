// IMPORTANT: For testing on your own laptop, leave this as "http://localhost:3000"
// When we put it on the internet later, we will change this line!
const socket = io("https://administrator-poultry-sys-witness.trycloudflare.com"); 

const joinScreen = document.getElementById('join-screen');
const videoChat = document.getElementById('video-chat');
const joinBtn = document.getElementById('join-btn');
const roomInput = document.getElementById('room-input');
const videoGrid = document.getElementById('video-grid');
const localVideo = document.getElementById('local-video');

let localStream;
let roomId;
const peers = {};

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
        let remoteVideo = document.getElementById(`video-${targetUserId}`);
        if (!remoteVideo) {
            remoteVideo = document.createElement('video');
            remoteVideo.id = `video-${targetUserId}`;
            remoteVideo.autoplay = true;
            remoteVideo.playsinline = true;
            videoGrid.appendChild(remoteVideo);
        }
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

socket.on('user-connected', async (userId) => {
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
    // Remove the remote video element
    const remoteVideo = document.getElementById(`video-${userId}`);
    if (remoteVideo) {
        remoteVideo.remove();
    }
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
    const videoGrid = document.getElementById('video-grid');
    const remoteVideos = videoGrid.querySelectorAll('video:not(#local-video)');
    remoteVideos.forEach(video => video.remove());
    
    // Notify others in the room that you're leaving
    socket.emit('user-disconnected', roomId);
    
    // Leave the room
    socket.off();
    
    // Reset and go back to join screen
    joinScreen.style.display = 'flex';
    videoChat.style.display = 'none';
    roomId = null;
};

joinBtn.onclick = async () => {
    roomId = roomInput.value.trim();
    if (!roomId) return alert("Enter a room code!");
    await initLocalMedia();
    joinScreen.style.display = 'none';
    videoChat.style.display = 'block';
    socket.emit('join-room', roomId);
};