


import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { FaFlag, FaCheckCircle } from 'react-icons/fa';
import 'tailwindcss/tailwind.css';

const FlagPost = ({ postId, postAuthorId }) => {
    const [reason, setReason] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [flagged, setFlagged] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
    const loggedInUserId = localStorage.getItem('userId'); // Assuming the logged-in user ID is stored here

    // Fetch report status on mount or when postId changes
    useEffect(() => {
        const fetchReportStatus = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(
                    `http://localhost:8000/posts/reports/${postId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.user_flagged) {
                    setFlagged(true);
                }
            } catch (err) {
                console.error('Error fetching report status:', err);
                setError('Failed to fetch report status.');
            } finally {
                setLoading(false);
            }
        };

        fetchReportStatus();
    }, [postId]);

    // Handle form submission
    const handleSubmit = async () => {
        const token = localStorage.getItem('token');

        try {
            await axios.post(
                'http://localhost:8000/posts/reports/',
                {
                    post: postId,
                    reason: reason,
                    additional_info: additionalInfo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccess(true);
            setError('');
            setFlagged(true);
            setShowModal(false);
            setShowSuccessModal(true); // Show success modal
            setShowError(false);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.detail);
            } else {
                setError('Failed to flag the post. Please try again.');
            }
            setSuccess(false);
        }
    };

    // Handle modal visibility and flagging logic
    const handleIconClick = () => {
        if (loggedInUserId === postAuthorId) {
            setShowError(true);
            setShowModal(false);
        } else if (!flagged) {
            setShowModal(true);
            setShowError(false);
        }
    };

    // Handle form submission event
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit();
    };

    // Close the success modal
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <div>
            {/* Only render the icon if the logged-in user is not the post author */}
            {loggedInUserId !== postAuthorId && (
                <div
                    onClick={handleIconClick}
                    style={{ cursor: flagged ? 'default' : 'pointer', display: 'inline-block', marginTop: '10px' }}
                    title={flagged ? 'You have reported this post' : 'Report this post'}
                >
                    {flagged ? (
                        <FaCheckCircle style={{ color: 'green', fontSize: '24px' }} />
                    ) : (
                        <FaFlag style={{ fontSize: '24px', color: 'lightblue' }} />
                    )}

                    {showError && (
                        <p className="text-red-500 mt-2 ml-2">You can't flag your own post.</p>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-xl font-semibold">Report this Post</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                                onClick={() => setShowModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        {loading ? (
                            <p className="mt-4">Loading...</p>
                        ) : flagged ? (
                            <p className="mt-4 text-green-500">You have already reported this post. Thank you!</p>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="mt-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700">Select Reason</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        value={reason}
                                    >
                                        <option value="">Select Reason</option>
                                        <option value="SPAM">Spam or misleading</option>
                                        <option value="INAPPROPRIATE">Inappropriate content</option>
                                        <option value="HARASSMENT">Harassment or hate speech</option>
                                        <option value="VIOLENCE">Violence or dangerous behavior</option>
                                        <option value="COPYRIGHT">Copyright infringement</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Additional Information (Optional)</label>
                                    <textarea
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Provide additional details..."
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        )}
                        {success && (
                            <p className="text-green-500 mt-2">
                                Thank you for your report. Our team will review the content shortly.
                            </p>
                        )}
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-semibold">Report Submitted!</h3>
                        <p className="mt-4 text-green-500">
                            Thank you for reporting this post. Our team will review it shortly.
                        </p>
                        <div className="flex justify-end">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                onClick={closeSuccessModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlagPost;
