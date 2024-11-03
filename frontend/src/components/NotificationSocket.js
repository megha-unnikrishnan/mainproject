
// // import React, { useEffect } from 'react';
// // import { useDispatch } from 'react-redux';
// // import { addNotification } from '../features/notificationSlice';

// // const NotificationSocket = () => {
// //     const dispatch = useDispatch();

// //     useEffect(() => {
// //         const token = localStorage.getItem('token'); 
// //         const socket = new WebSocket('ws://localhost:8000/ws/notifications/'); // Adjust the URL as necessary
// //         console.log(socket);
        
// //         socket.onopen = () => {
// //             console.log('WebSocket connected');
// //         };

// //         socket.onmessage = (event) => {
// //             console.log('Message received from WebSocket:', event.data);
// //             try {
// //                 const notification = JSON.parse(event.data);
// //                 console.log('Parsed notification:', notification);
// //                 dispatch(addNotification(notification)); // Dispatch the action
// //             } catch (error) {
// //                 console.error('Error parsing notification:', error);
// //             }
// //         };
// //         socket.onerror = (event) => {
// //             console.error('WebSocket error observed:', event);
// //         };
        
        
        
        

// //         socket.onclose = () => {
// //             console.log('WebSocket disconnected');
// //         };

// //         return () => {
// //             socket.close();
// //         };
// //     }, [dispatch]);

// //     return null; // No UI component is rendered
// // };

// // export default NotificationSocket;
// // NotificationSocket.js
// import React, { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { addNotification } from '../features/notificationSlice';

// const NotificationSocket = () => {
//     const dispatch = useDispatch();

//     useEffect(() => {
//         const token = localStorage.getItem('token'); // Adjust if necessary
// const socket = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
// // Adjust URL as necessary
//         console.log(socket)
//         socket.onmessage = (event) => {
//   const notification = JSON.parse(event.data);
//   console.log('Received notification:', notification); // Added logging
//   dispatch(addNotification(notification));  // Dispatch action to Redux store
// };

//         return () => {
//             socket.close(); // Clean up on unmount
//         };
//     }, [dispatch]);

//     return null;
// };

// export default NotificationSocket; // Ensure this is a default export
