// features/selectors.js
import { createSelector } from 'reselect';

// Selectors
const selectUsers = (state) => state.user.users;
const selectFilter = (state) => state.user.filter;

export const selectFilteredUsers = createSelector(
  [selectUsers, selectFilter],
  (users, filter) => {
    switch (filter) {
      case 'Active Users':
        return users.filter(user => !user.is_suspended);
      case 'Blocked Users':
        return users.filter(user => user.is_suspended);
      default:
        return users;
    }
  }
);
