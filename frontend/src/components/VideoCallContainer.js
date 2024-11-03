// VideoCallContainer.js
import React, { useEffect, useState, useRef } from 'react';
import VideoCall from './VideoCall';

const VideoCallContainer = ({ recipientId, websocket }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnection = useRef(new RTCPeerConnection());

    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
    
                peerConnection.current.ontrack = (event) => {
                    const [remoteStream] = event.streams;
                    setRemoteStream(remoteStream);
                };
    
                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        websocket.send(JSON.stringify({
                            action: 'ice_candidate',
                            candidate: event.candidate,
                        }));
                    }
                };
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };
    
        getUserMedia();
    
        websocket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            switch (data.action) {
                case 'video_call_initiated':
                    handleIncomingCall();
                    break;
                case 'ice_candidate_received':
                    const candidate = new RTCIceCandidate(data.candidate);
                    peerConnection.current.addIceCandidate(candidate).catch(error => {
                        console.error("Error adding ICE candidate:", error);
                    });
                    break;
                case 'video_call_answered':
                    handleAnswer(data.answer);
                    break;
                default:
                    console.warn("Unhandled message action:", data.action);
            }
        };
    
        return () => {
            peerConnection.current.close();
        };
    }, [websocket]);
    
    const handleIncomingCall = async () => {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        websocket.send(JSON.stringify({
            action: 'start_video_call',
            recipient_id: recipientId,
            offer: offer,
        }));
    };

    const handleAnswer = async (answer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const endCall = () => {
        peerConnection.current.close();
        setLocalStream(null);
        setRemoteStream(null);
    };

    return (
        <VideoCall localStream={localStream} remoteStream={remoteStream} onEndCall={endCall} />
    );
};

export default VideoCallContainer;
