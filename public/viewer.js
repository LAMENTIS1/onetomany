window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    };
}

async function init() {
    console.log('Init function called');
    const peer = createPeer();
    peer.addTransceiver('video', { direction: 'recvonly' });
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.stunprotocol.org'
            }
        ]
    });

    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    console.log('Negotiation needed');
    try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const payload = {
            sdp: peer.localDescription
        };

        const { data } = await axios.post('/consumer', payload);
        const desc = new RTCSessionDescription(data.sdp);
        await peer.setRemoteDescription(desc);
    } catch (error) {
        console.error('Error during negotiation:', error);
    }
}

function handleTrackEvent(event) {
    console.log('Track event received');
    const videoElement = document.getElementById('video');
    videoElement.srcObject = event.streams[0];
}
