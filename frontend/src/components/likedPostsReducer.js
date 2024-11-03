// likedPostsReducer.js
const initialState = [];

const likedPostsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LIKE_POST':
      return [...state, action.postId];
    case 'UNLIKE_POST':
      return state.filter((id) => id !== action.postId);
    default:
      return state;
  }
};

export default likedPostsReducer;