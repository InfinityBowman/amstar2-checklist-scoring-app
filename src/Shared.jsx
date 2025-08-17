import { createSignal, onCleanup, Show } from 'solid-js';

/**
 * TODO
 * On join room owner needs to send room state to joiners
 */
const SIGNAL_URL = 'ws://localhost:3000';

export default function SharedCheckbox() {
  const [checked, setChecked] = createSignal(false);
  const [roomInput, setRoomInput] = createSignal('');
  const [room, setRoom] = createSignal('');
  const [joined, setJoined] = createSignal(false);
  let ws, pc, dc;

  function setupWebRTC(isOfferer) {
    pc = new RTCPeerConnection();
    console.log(`[WebRTC] PeerConnection created. isOfferer: ${isOfferer}`);

    if (isOfferer) {
      dc = pc.createDataChannel('checkbox');
      console.log('[WebRTC] DataChannel created by offerer');
      dc.onopen = () => console.log('[WebRTC] DataChannel open');
      dc.onmessage = (e) => {
        console.log(`[WebRTC] DataChannel message received: ${e.data}`);
        setChecked(e.data === 'true');
      };
      dc.onerror = (e) => console.error('[WebRTC] DataChannel error:', e);
      dc.onclose = () => console.log('[WebRTC] DataChannel closed');
    } else {
      pc.ondatachannel = (event) => {
        dc = event.channel;
        console.log('[WebRTC] DataChannel received by answerer');
        dc.onopen = () => console.log('[WebRTC] DataChannel open');
        dc.onmessage = (e) => {
          console.log(`[WebRTC] DataChannel message received: ${e.data}`);
          setChecked(e.data === 'true');
        };
        dc.onerror = (e) => console.error('[WebRTC] DataChannel error:', e);
        dc.onclose = () => console.log('[WebRTC] DataChannel closed');
      };
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] ICE candidate generated:', event.candidate);
        ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, room: room() }));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
    };
  }

  function connectToRoom(roomName) {
    ws = new WebSocket(SIGNAL_URL);

    ws.onopen = () => {
      console.log('[WS] Connected to signaling server');
      ws.send(JSON.stringify({ type: 'join', room: roomName }));
    };

    let isOfferer = false;
    ws.onmessage = async (event) => {
      let data;
      if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
      } else if (event.data instanceof Blob) {
        const text = await event.data.text();
        data = JSON.parse(text);
      } else {
        console.warn('[WS] Unknown message type:', event.data);
        return;
      }
      console.log('[WS] Message received:', data);

      if (data.type === 'join') {
        if (!pc) {
          isOfferer = true;
          setupWebRTC(true);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log('[WebRTC] Sending offer');
          ws.send(JSON.stringify({ type: 'offer', offer, room: roomName }));
        }
      } else if (data.type === 'offer') {
        setupWebRTC(false);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('[WebRTC] Received offer, sending answer');
        ws.send(JSON.stringify({ type: 'answer', answer, room: roomName }));
      } else if (data.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log('[WebRTC] Received answer, set as remote description');
      } else if (data.type === 'candidate' && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('[WebRTC] Added ICE candidate');
        } catch (e) {
          console.warn('[WebRTC] Error adding ICE candidate:', e);
        }
      }
    };

    ws.onerror = (err) => {
      console.error('[WS] WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('[WS] WebSocket closed');
    };

    onCleanup(() => {
      ws && ws.close();
      pc && pc.close();
      console.log('[Cleanup] Closed WebSocket and PeerConnection');
    });
  }

  const handleChange = (e) => {
    setChecked(e.target.checked);
    if (dc && dc.readyState === 'open') {
      console.log(`[WebRTC] Sending checkbox state: ${e.target.checked}`);
      dc.send(e.target.checked ? 'true' : 'false');
    } else {
      console.warn('[WebRTC] DataChannel not open, cannot send checkbox state');
    }
  };

  const handleCreateRoom = () => {
    if (!roomInput().trim()) return;
    setRoom(roomInput().trim());
    setJoined(true);
    connectToRoom(roomInput().trim());
  };

  const handleJoinRoom = () => {
    if (!roomInput().trim()) return;
    setRoom(roomInput().trim());
    setJoined(true);
    connectToRoom(roomInput().trim());
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <Show when={!joined()}>
        <div>
          <input
            type="text"
            placeholder="Room name"
            value={roomInput()}
            onInput={(e) => setRoomInput(e.target.value)}
            class="m-1 bg-blue-100 rounded-md p-1"
          />
          <button
            onClick={handleCreateRoom}
            class="m-2 bg-green-200 p-2 rounded-md"
          >
            Create Room
          </button>
          <button
            onClick={handleJoinRoom}
            class="m-2 bg-blue-200 p-2 rounded-md"
          >
            Join Room
          </button>
        </div>
      </Show>
      <Show when={joined()}>
        <div>
          <div class="m-1">
            Room: <b>{room()}</b>
          </div>
          <label>
            <input
              type="checkbox"
              checked={checked()}
              onInput={handleChange}
            />
            Check me!
          </label>
          <div class="m-1">Open this page in two tabs/windows and join the same room to test real-time sync.</div>
        </div>
      </Show>
    </div>
  );
}
