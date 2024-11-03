



import React, { useEffect, useState } from 'react';

const Like = ({ postId }) => {
    const [liked, setLiked] = useState(false); // Liked state for the user
    const [totalLikes, setTotalLikes] = useState(0); // Total likes count for the post

    // Fetch the like status and total likes when the component mounts or postId changes
    useEffect(() => {
        const fetchPostLikes = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:8000/posts/postslikeslist/${postId}/likes/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                console.log('Fetch Post Likes Response:', data); // Debugging line

                if (response.ok) {
                    setTotalLikes(data.total_likes); // Set the total likes count
                    const currentUser = localStorage.getItem('username'); // Get the current username
                    // Set liked state based on whether the current user is in liked_usernames
                    setLiked(data.liked_usernames ? data.liked_usernames.includes(currentUser) : false);
                    console.log('Liked state after fetch:', liked); // Debugging line
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching post likes:', error);
            }
        };

        fetchPostLikes(); // Call the function to fetch likes data
    }, [postId]); // Re-run this when postId changes
    

    // Handle liking the post
    const handleLike = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/posts/posts-like/${postId}/like/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setTotalLikes(data.total_likes); // Update total likes
                setLiked(true); // Set liked to true
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error liking the post:', error);
        }
    };

    // Handle unliking the post
    const handleUnlike = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/posts/posts-unlike/${postId}/unlike/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Check if there's no content response
                if (response.status !== 204) {
                    const data = await response.json();
                    setTotalLikes(data.total_likes); // Update total likes
                }
                setLiked(false); // Set liked to false
                console.log('Liked state after unlike:', false); // Debugging line
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error unliking the post:', error);
        }
    };

    // Return the like/unlike button and total likes count
    return (
        <div className="like">
            <p>Total Likes: {totalLikes}</p>
            {liked ? (
                <button onClick={handleUnlike} className="bg-red-500 text-white p-2 rounded">
                    Unlike
                </button>
            ) : (
                <button onClick={handleLike} className="bg-blue-500 text-white p-2 rounded">
                    Like
                </button>
            )}
        </div>
    );
};

export default Like;




