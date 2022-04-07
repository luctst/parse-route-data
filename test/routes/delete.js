const { default: mongoose } = require("mongoose");

module.exports = [
  {
    path: '/api/deletewithparamsarray',
    data: {
      array: {
        type: Array,
        itemsType: mongoose.Types.ObjectId,
        required: true,
      }
    },
  },
];