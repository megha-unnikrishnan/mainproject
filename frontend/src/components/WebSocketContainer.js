// import React, { useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addNotification } from '../features/notificationSlice';

// const WebSocketContainer = () => {
//   const dispatch = useDispatch();
//   const userId = useSelector((state) => state.auth.user?.id);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     if (!userId) return; // Ensure userId is available

//     // Create a WebSocket connection
//     socketRef.current = new WebSocket(`ws://your-websocket-url/${userId}`);

//     // Define the onOpen event
//     socketRef.current.onopen = () => {
//       console.log('WebSocket connection established');
//     };

//     // Define the onMessage event
//     socketRef.current.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       if (message.type === 'notification') {
//         dispatch(addNotification(message.payload)); // Dispatch action to add notification
//       }
//     };

//     // Define the onClose event
//     socketRef.current.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     // Cleanup on component unmount
//     return () => {
//       socketRef.current.close();
//     };
//   }, [userId, dispatch]);

//   return null; // This component does not render anything
// };

// export default WebSocketContainer;
