// import React, { useState } from 'react';

// const EditMessage = ({ message, socket, onClose }) => {
//     const [newContent, setNewContent] = useState(message.content);
//     const [newImage, setNewImage] = useState(null);
//     const [newVideo, setNewVideo] = useState(null);

//     // Function to handle image upload
//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setNewImage(reader.result.split(',')[1]); // Base64 without the prefix
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     // Function to handle video upload
//     const handleVideoChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setNewVideo(reader.result.split(',')[1]); // Base64 without the prefix
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     // Function to handle submission of the edited message
//     const handleSubmit = (e) => {
//         e.preventDefault();

//         const editMessageData = {
//             action: 'edit_message', // Action type for the server
//             message_id: message.id,
//             new_content: newContent,
//             image: newImage,
//             video: newVideo,
//         };

//         // Send the edit request to the WebSocket server
//         socket.send(JSON.stringify(editMessageData));
//         onClose(); // Close the edit modal or form after submission


        
//     };

//     return (
//         <div className="edit-message-modal">
//             <form onSubmit={handleSubmit}>
//                 <textarea
//                     value={newContent}
//                     onChange={(e) => setNewContent(e.target.value)}
//                     placeholder="Edit your message..."
//                     required
//                 />
//                 <div>
//                     <label>
//                         Upload New Image:
//                         <input type="file" accept="image/*" onChange={handleImageChange} />
//                     </label>
//                 </div>
//                 <div>
//                     <label>
//                         Upload New Video:
//                         <input type="file" accept="video/*" onChange={handleVideoChange} />
//                     </label>
//                 </div>
//                 <button type="submit">Save Changes</button>
//                 <button type="button" onClick={onClose}>Cancel</button>
//             </form>
//         </div>
//     );
// };

// export default EditMessage;















// import React, { useState } from 'react';

// const EditMessage = ({ message, socket, onClose }) => {
//     const [newContent, setNewContent] = useState(message.content);
//     const [newImage, setNewImage] = useState(null);
//     const [newVideo, setNewVideo] = useState(null);

//     // Function to handle image upload
//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setNewImage(reader.result); // Base64 with the prefix
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     // Function to handle video upload
//     const handleVideoChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setNewVideo(reader.result); // Base64 with the prefix
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     // Function to handle submission of the edited message
//     const handleSubmit = (e) => {
//         e.preventDefault();

//         const editMessageData = {
//             action: 'edit_message', // Action type for the server
//             message_id: message.id,
//             new_content: newContent,
//             image: newImage,
//             video: newVideo,
//         };

//         // Send the edit request to the WebSocket server
//         socket.send(JSON.stringify(editMessageData));
//         onClose(); // Close the edit modal or form after submission
//     };

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
//             <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 w-full max-w-lg">
//                 <h2 className="text-2xl font-semibold text-white mb-6">Edit Your Message</h2>
//                 <form onSubmit={handleSubmit}>
//                     <textarea
//                         className="w-full h-32 p-4 border border-gray-300 rounded-lg mb-4 resize-none"
//                         value={newContent}
//                         onChange={(e) => setNewContent(e.target.value)}
//                         placeholder="Edit your message..."
//                         required
//                     />
//                     <div className="mb-4">
//                         <label className="block text-white mb-2">
//                             Upload New Image:
//                             <input 
//                                 type="file" 
//                                 accept="image/*" 
//                                 onChange={handleImageChange} 
//                                 className="block mt-1 text-white" 
//                             />
//                         </label>
//                         {newImage && (
//                             <img
//                                 src={newImage}
//                                 alt="Preview"
//                                 className="mt-2 rounded-lg shadow-lg w-full h-auto"
//                             />
//                         )}
//                     </div>
//                     <div className="mb-4">
//                         <label className="block text-white mb-2">
//                             Upload New Video:
//                             <input 
//                                 type="file" 
//                                 accept="video/*" 
//                                 onChange={handleVideoChange} 
//                                 className="block mt-1 text-white" 
//                             />
//                         </label>
//                         {newVideo && (
//                             <video
//                                 controls
//                                 className="mt-2 rounded-lg shadow-lg w-full"
//                             >
//                                 <source src={newVideo} type="video/mp4" />
//                                 Your browser does not support the video tag.
//                             </video>
//                         )}
//                     </div>
//                     <div className="flex justify-between">
//                         <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
//                             Save Changes
//                         </button>
//                         <button type="button" onClick={onClose} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">
//                             Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default EditMessage;








import React, { useState } from 'react';

const EditMessage = ({ message, socket, onClose }) => {
    const [newContent, setNewContent] = useState(message.content);
    const [newImage, setNewImage] = useState(null);
    const [newVideo, setNewVideo] = useState(null);

    // Function to handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImage(reader.result); // Base64 with the prefix
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to handle video upload
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewVideo(reader.result); // Base64 with the prefix
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to handle submission of the edited message
    const handleSubmit = (e) => {
        e.preventDefault();

        const editMessageData = {
            action: 'edit_message', // Action type for the server
            message_id: message.id,
            new_content: newContent,
            image: newImage,
            video: newVideo,
        };

        // Send the edit request to the WebSocket server
        socket.send(JSON.stringify(editMessageData));

        onClose(); // Close the edit modal or form after submission

        // Refresh the page
        // window.location.reload();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-semibold text-white mb-6">Edit Your Message</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg mb-4 resize-none"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Edit your message..."
                        required
                    />
                    <div className="mb-4">
                        <label className="block text-white mb-2">
                            Upload New Image:
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="block mt-1 text-white" 
                            />
                        </label>
                        {newImage && (
                            <img
                                src={newImage}
                                alt="Preview"
                                className="mt-2 rounded-lg shadow-lg w-full h-auto"
                            />
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-white mb-2">
                            Upload New Video:
                            <input 
                                type="file" 
                                accept="video/*" 
                                onChange={handleVideoChange} 
                                className="block mt-1 text-white" 
                            />
                        </label>
                        {newVideo && (
                            <video
                                controls
                                className="mt-2 rounded-lg shadow-lg w-full"
                            >
                                <source src={newVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
                            Save Changes
                        </button>
                        <button type="button" onClick={onClose} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMessage;
