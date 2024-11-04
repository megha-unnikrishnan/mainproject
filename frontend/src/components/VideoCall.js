





import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaVideo, FaPhoneSlash } from "react-icons/fa";

const VideoCall = () => {
    const { userId } = useParams();  // recipient's ID
    const currentUser =  useSelector((state) => state.auth.user);
    console.log('')
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const ws = useRef(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCallReceived, setIsCallReceived] = useState(false);
    const [isCaller, setIsCaller] = useState(true);
    // const token = useSelector((state) => state.auth.token);
    const [isWsConnected, setIsWsConnected] = useState(false);
    const pendingCandidates = [];
    const [isPopupVisible, setPopupVisible] = useState(false);

const togglePopup = () => setPopupVisible(!isPopupVisible);

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const token = localStorage.getItem('token');
        ws.current = new WebSocket(`${wsProtocol}://localhost:8000/ws/video-call/${currentUser.id}/${userId}/?token=${token}`);

        ws.current.onopen = () => {
            console.log("WebSocket connection established.");
            setIsWsConnected(true);
        };

        ws.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log("Message received from WebSocket:", data);

            switch (data.action) {
                case 'video_call_offer':
                    setIsCallReceived(true);
                    setIsCaller(false);
                    handleOffer(data.offer);
                    break;
                case 'video_call_answer':
                    handleVideoCallAnswered(data.answer);
                    break;
                case 'ice_candidate':
                    handleICECandidate(data.candidate);
                    break;
                case 'call_accepted':
                    setIsCallActive(true);
                    setIsCallReceived(false);
                    break;
                case 'call_rejected':
                    setIsCallReceived(false);
                    break;
                case 'end_call':
                    if (isCallActive) {
                        endCall();
                    }
                    break;
                default:
                    console.warn(`Unhandled action type: ${data.action}`);
                    break;
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
                console.log("WebSocket connection closed.");
                setIsWsConnected(false);
            }
        };
    }, [userId, isCallActive]);

    const startLocalVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach(track => {
                    if (peerConnection.current) {
                        peerConnection.current.addTrack(track, stream);
                    }
                });
            }
        } catch (error) {
            console.error("Error accessing local media: ", error);
        }
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const createPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate) {
                while (ws.current.readyState !== WebSocket.OPEN) {
                    await delay(100);
                }
                
                ws.current.send(JSON.stringify({
                    action: 'ice_candidate',
                    candidate: event.candidate,
                    recipient_id: userId
                }));
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    };

    const handleOffer = async (offer) => {
        if (!peerConnection.current) createPeerConnection();
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    
        while (pendingCandidates.length > 0) {
            const candidate = pendingCandidates.shift();
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const acceptCall = async () => {
        if (!peerConnection.current || isCaller) return;

        await startLocalVideo();
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        ws.current.send(JSON.stringify({
            action: 'video_call_answer',
            answer: peerConnection.current.localDescription,
            recipient_id: userId
        }));

        setIsCallActive(true);
        setIsCallReceived(false);
    };

    const handleVideoCallAnswered = async (answer) => {
        if (!peerConnection.current) {
            createPeerConnection();
        }
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        
        while (pendingCandidates.length > 0) {
            const candidate = pendingCandidates.shift();
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const handleICECandidate = async (candidate) => {
        if (candidate) {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                pendingCandidates.push(candidate);
            }
        }
    };

    const startCall = async () => {
        if (!peerConnection.current) createPeerConnection();
        await startLocalVideo();
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        ws.current.send(JSON.stringify({
            action: 'video_call_offer',
            offer: offer,
            recipient_id: userId
        }));
        setIsCallActive(true);
    };

    const endCall = () => {
        if (ws.current) {
            ws.current.send(JSON.stringify({
                action: 'end_call',
                sender_id: currentUser.id,
                recipient_id: userId
            }));
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setIsCallActive(false);
        setIsCallReceived(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-4/5 w-full">
    {/* Local Video Section */}
    <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="rounded-lg overflow-hidden w-full max-w-md h-full flex items-center justify-center"  style={{ marginBottom: '52%',width:'78%',height:'53%' }}>
            <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
        </div>
        <div className="mt-2 flex space-x-4" style={{marginLeft:'107%'}} >
            {isCallActive && (
                <button
                    onClick={endCall}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                >
                    <FaPhoneSlash className="w-6 h-6" />
                </button>
            )}
        </div>
        
        {/* Incoming Call Popup */}
        {!isCallActive && isCallReceived && !isCaller && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
                    <p className="text-lg font-semibold mb-4">Incoming call from {currentUser}...</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={acceptCall}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                        >
                            Accept
                        </button>
                        <button
                            onClick={endCall}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Start Call Button */}
        {!isCallActive && !isCallReceived && isCaller && (
            <div style={{marginRight:'511%',marginTop:'-103%'}}>
                <button
                    onClick={startCall}
                    className="bg-blue-400 p-2 rounded-full text-white hover:bg-blue-500 shadow-lg transition-all duration-300"
                >
                    <FaVideo className="w-8 h-8" />
                </button>
            </div>
        )}
    </div>

    {/* Remote Video Section */}
    <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div 
            className="rounded-lg overflow-hidden w-full max-w-md h-full flex items-center justify-center cursor-pointer"
            style={{ marginBottom: '63%',width:'77%',height:'67%' }}
            onClick={togglePopup}
        >
            <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
        </div>
    </div>

    {/* Popup Modal for Remote Video */}
    {isPopupVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="rounded-lg overflow-hidden w-full max-w-3xl h-3/4 flex items-center justify-center relative">
                <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                <button
                    onClick={togglePopup}
                    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full"
                >
                    Close
                </button>
            </div>
        </div>
    )}
</div>

    );
};

export default VideoCall;


