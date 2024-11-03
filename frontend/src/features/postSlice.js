



// features/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to create a post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token'); // Adjust based on where your token is stored

      // Include token in headers if available
      const response = await axios.post('http://localhost:8000/posts/post-create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Add the token here
        },
      });
      return response.data; // Ensure this is returning the expected data
    } catch (err) {
      console.error('Error creating post:', err); // Log the error for debugging
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      return rejectWithValue(errorMessage);
    }
  }
);






export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (postIds, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/posts/fetch-posts/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          ids: postIds, // Pass the post IDs as query parameters
        },
      });
      const posts = response.data.map(post => ({
        ...post,
     // Calculate total likes
        // total_comments: post.comments?.length ?? 0, // Calculate total comments
      }));
      // console.log('Total Comments', posts.map(p => p.total_comments)); // Log to check if comments are coming
      return posts;
    } catch (err) {
      console.error('Error fetching posts:', err);
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      
      return rejectWithValue(errorMessage);
    }
  }
);











// Async thunk for editing a post
// Async thunk for editing a post
export const editPost = createAsyncThunk(
  'posts/editPost',
  async ({ postId, updatedData }) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:8000/posts/posts-detail/${postId}/`, updatedData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Post edited successfully:', response.data); // Log the response data
      return response.data; // Return the updated post data
    } catch (error) {
      console.error('Error editing post:', error.response?.data || 'Failed to edit post'); // Log error details
      return Promise.reject(error.response?.data || 'Failed to edit post');
    }
  }
);
// Thunk to delete a post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(`http://localhost:8000/posts/posts-detail/${postId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      return postId; // Return the post ID to identify which post to remove
    } catch (err) {
      console.error('Error deleting post:', err);
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      return rejectWithValue(errorMessage);
    }
  }
);






export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await axios.get(`http://localhost:8000/posts/users-posts/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}` // Include token in the request header
        },
      });
      return response.data; // Return the response data (user posts)
    } catch (err) {
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      return rejectWithValue(errorMessage); // Handle error
    }
  }
);






export const fetchUserPostsDetails = createAsyncThunk(
  'posts/fetchUserPostsDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await axios.get(`http://localhost:8000/posts/users-post-profile/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}` // Include token in the request header
        },
      });
      return response.data; // Return the response data (user posts)
    } catch (err) {
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      return rejectWithValue(errorMessage); // Handle error
    }
  }
);








export const likePost = createAsyncThunk('posts/likePost', async (postId, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8000/posts/posts-like/${postId}/like/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
      
      
  });


  return postId; // return the postId to update the state
});


export const unlikePost = createAsyncThunk('posts/unlikePost', async (postId, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8000/posts/posts-unlike/${postId}/unlike/`, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
  });



  return postId; // return the postId to update the state
});




export const listLikes = createAsyncThunk(
  'posts/listLikes',
  async (postId, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/postslikeslist/${postId}/likes/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error details from response
        throw new Error(`Failed to retrieve likes: ${errorData.message || response.statusText}`);
      }

      const data = await response.json(); // Parse the response data
      return { postId, likes: response.data };

    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);







export const createBookmark = createAsyncThunk('posts/createBookmark', async (postId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(`http://localhost:8000/posts/bookmark/${postId}/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return postId; // Return the postId after successful creation
  } catch (error) {
    return rejectWithValue(error.response.data || error.message);
  }
});



export const deleteBookmark = createAsyncThunk(
  'posts/deleteBookmark',
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/posts/bookmarks/${postId}/`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return postId;  // Return the postId for removal
    } catch (error) {
      return rejectWithValue(error.response.data || error.message);
    }
  }
);

export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetchBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/posts/bookmarks/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Assuming response.data is an array of posts, map it to just get post IDs
      const postIds = response.data.map(post => post.id); 
      return postIds; 
    } catch (error) {
      return rejectWithValue(error.response.data || error.message);
    }
  }
);




export const createComment = createAsyncThunk(
  'posts/createComment',
  async ({ content, postId, parent }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token before request:', token);

      const response = await axios.post(
        `http://localhost:8000/posts/posts-comments-create/${postId}/comments/`,
        {
          content,
          parent: parent || null, // Pass null if there's no parent
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Comment created successfully:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
      } else if (error.request) {
        console.error('Error Request:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      throw error; // Rethrow the error to handle it in the component
    }
  }
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId) => {
    if (!postId) {
      throw new Error('postId is required');
    }

    // console.log(`Fetching comments for postId: ${postId}`); // Log postId

    const response = await axios.get(`http://localhost:8000/posts/comments-list/${postId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with your actual token logic
      },
    });

    return { postId, comments: response.data };
  }
);




export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ commentId, postId, token }, { rejectWithValue }) => {
    
      const response = await fetch(`http://localhost:8000/posts/delete/comments/${commentId}/`, {
      
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          return rejectWithValue("Failed to delete comment");
      }

      // Return the comment ID and post ID for further processing
      return { commentId, postId };
  }
);






// Slice definition
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],  // Store posts in an array
     userPosts: [],
     postdetails:[],
    loading: false,
    error: null,
    status: 'idle',
    profile: null,
    likedPosts: [],
    is_liked: false,
    bookmarks: [],
    // comments: [],
    comments: {},
    total_comments: {},
    likedPosts: JSON.parse(localStorage.getItem('likedPosts')) || [],
 
  },
  reducers: {setPosts: (state, action) => {
    state.posts = action.payload;
    console.log('Posts set:', action.payload); // Log when posts are set
  },
  setBookmarks(state, action) {
    state.bookmarks = action.payload;
}, 


updateComments(state, action) {
  const { postId, comments } = action.payload;
  const postIndex = state.posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    state.posts[postIndex] = {
      ...state.posts[postIndex],
      comments, // Update comments
      total_comments: comments.length // Update comment count based on new comments
    };
  }
},
updateTotalComments: (state, action) => {
  const { postId } = action.payload;
  const post = state.posts.find(post => post.id === postId);
  if (post) {
      post.total_comments += 1; // Increment the total comments count
  }
},


addComment: (state, action) => {
  const { postId, newComment, parentId } = action.payload;

  // Check if the comments array exists for the postId
  if (!state.comments[postId]) {
      state.comments[postId] = [];
  }

  if (parentId) {
      // Find the parent comment
      const parentComment = state.comments[postId].find(comment => comment.id === parentId);

      // If parent comment exists, add the new reply to its replies array
      if (parentComment) {
          if (!parentComment.replies) {
              parentComment.replies = []; // Initialize replies array if it doesn't exist
          }
          parentComment.replies.push(newComment); // Add the new reply
      }
  } else {
      // If no parentId, push the comment as a new top-level comment
      state.comments[postId].push(newComment);
  }
},

toggleLikePost(state, action) {
  const postId = action.payload;
  if (state.likedPosts.includes(postId)) {
    state.likedPosts = state.likedPosts.filter(id => id !== postId);
  } else {
    state.likedPosts.push(postId);
  }
},



},
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true; 
        state.error = null; // Clear error on new request
      })
      .addCase(createPost.fulfilled, (state, { payload }) => {
        state.loading = false; 
        // state.posts.push(payload); // Make sure payload contains the post data
        state.posts.push({ ...payload, total_likes: payload.likes?.count ?? 0 }); // Make sure payload contains the post data
      })
      .addCase(createPost.rejected, (state, { payload }) => {
        state.loading = false; 
        state.error = payload?.detail || 'Failed to create post'; // Handle undefined payload
        console.error('Post creation failed:', state.error); // Log the error message
      })



      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear error on new request
      })
      .addCase(fetchPosts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.posts = payload; // Update posts with fetched data
       
        
      })
      .addCase(fetchPosts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.detail || 'Failed to fetch posts';
        console.error('Fetch posts failed:', state.error);
      })
      .addCase(editPost.pending, (state) => {
        state.loading = true; // Set loading to true when editing starts
        state.error = null; // Reset error
        console.log('Editing post...'); // Log when editing starts
      })
      .addCase(editPost.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false when editing succeeds
        console.log('Post edited:', action.payload); // Log the edited post
        // Find the index of the edited post and update it
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = {
            ...state.posts[index],
            content: action.payload.content,
            image: action.payload.image,
            video: action.payload.video,
          }; // Update the post
        }
      
      })
      .addCase(editPost.rejected, (state, action) => {
        state.loading = false; // Set loading to false when editing fails
        state.error = action.payload; // Set the error message
        console.error('Failed to edit post:', action.payload); // Log the error message
      })
      .addCase(deletePost.pending, (state) => {
        state.loading = true; 
        state.error = null; // Clear error on new request
      })
      .addCase(deletePost.fulfilled, (state, { payload }) => {
        state.loading = false; 
        state.posts = state.posts.filter((post) => post.id !== payload); // Remove deleted post
      })
      .addCase(deletePost.rejected, (state, { payload }) => {
        state.loading = false; 
        state.error = payload?.detail || 'Failed to delete post'; // Handle undefined payload
        console.error('Post deletion failed:', state.error); // Log the error message
      })


      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.detail; // Set the error message from the backend
      })



      .addCase(fetchUserPostsDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserPostsDetails.fulfilled, (state, action) => {
        console.log('Previous state:', JSON.stringify(state)); // Log the previous state
        state.status = 'succeeded';
        state.profile = action.payload.user;
        console.log('Updated profile:', state.profile); // Log the updated profile
        
        state.postdetails = action.payload.posts;
        console.log('Updated post details:', state.postdetails); // Log the updated post details
        console.log('New state:', JSON.stringify(state)); // Log the new state
    })
    
      .addCase(fetchUserPostsDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
  
// .addCase(likePost.fulfilled, (state, action) => {
//   const { id, total_likes } = action.payload;
//   const post = state.posts.find(p => p.id === id);
//   if (post) {
//       post.total_likes = total_likes;
//       post.user_liked = true;
//       if (!state.likedPosts.includes(id)) {
//           state.likedPosts.push(id); // Add to liked posts if not already liked
//           localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts)); // Update local storage
//       }
//   }
// })
// .addCase(unlikePost.fulfilled, (state, action) => {
//   const { id, total_likes } = action.payload;
//   const post = state.posts.find(p => p.id === id);
//   if (post) {
//       post.total_likes = total_likes;
//       post.user_liked = false;
//       state.likedPosts = state.likedPosts.filter(postId => postId !== id); // Remove from liked posts
//       localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts)); // Update local storage
//   }
// })
 .addCase(likePost.pending, (state) => {
  state.loading = true;
})
.addCase(likePost.fulfilled, (state, action) => {
  state.loading = false;
  state.likedPosts.push(action.payload.postId);
})
.addCase(likePost.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
})
.addCase(unlikePost.pending, (state) => {
  state.loading = true;
})
.addCase(unlikePost.fulfilled, (state, action) => {
  state.loading = false;
  state.likedPosts = state.likedPosts.filter(id => id !== action.payload);
})
.addCase(unlikePost.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
})
.addCase(listLikes.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(listLikes.fulfilled, (state, action) => {
  const { postId, likedUsers, totalLikes } = action.payload;
  state.likes[postId] = { likedUsers, totalLikes };
  state.loading = false;
})
.addCase(listLikes.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload.message; // Handle error message
})


.addCase(createComment.fulfilled, (state, action) => {
  const { postId } = action.meta.arg; // Get postId from arg
  const newComment = action.payload; // New comment from API response
  state.comments[postId].push(newComment); // Add new comment to the state
})

.addCase(createComment.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
})


.addCase(fetchComments.pending, (state) => {
  state.loading = true;
})
.addCase(fetchComments.fulfilled, (state, action) => {
  const { postId, comments } = action.payload; // Adjust based on your API response
  state.comments[postId] = comments; // Store comments by postId
  state.loading = false;
})

.addCase(fetchComments.rejected, (state) => {
  state.loading = false;
})





.addCase(deleteComment.fulfilled, (state, action) => {
  const { commentId, postId } = action.payload;
  const post = state.posts.find(post => post.id === postId);
  if (post) {
      post.comments = post.comments.filter(comment => comment.id !== commentId);
  }
})
.addCase(deleteComment.rejected, (state, action) => {
  console.error(action.payload);
})
.addCase(fetchBookmarks.fulfilled, (state, action) => {
  state.bookmarks = action.payload; // Update bookmarks from the server
})
.addCase(createBookmark.fulfilled, (state, action) => {
  state.bookmarks.push(action.payload); // Add the new bookmark
})
.addCase(deleteBookmark.fulfilled, (state, action) => {
  state.bookmarks = state.bookmarks.filter(bookmark => bookmark !== action.payload); // Remove the bookmark
})




  

  }
});
export const { setBookmarks,updateComments,updateTotalComments,addComment,toggleLikePost } = postsSlice.actions;
export default postsSlice.reducer;
