module.exports = [
  {
    path: '/user/:userId',
    data: {
      new: {
        type: Boolean,
        required: true,
      },
    },
  },
];