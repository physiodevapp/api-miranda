let userListSeed;

module.exports = {
  getUserListSeed: () => userListSeed,
  setUserListSeed: (list) => {
    userListSeed = list;
  },
};