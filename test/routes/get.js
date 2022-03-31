const mongoose = require('mongoose');

module.exports = [
  {
    path: '/api/test/:kuid',
    data: {
      keywords: {
        type: String,
        required: true,
      }
    },
  },
  {
    path: '/api/verify/objectid',
    data: {
      kuid: {
        type: mongoose.Types.ObjectId,
        required: true,
      }
    },
  },
  {
    path: '/api/room/:uuid',
    data: {
      createSession: {
        type: Boolean,
        default: false,
      }
    },
  },
  {
    path: '/:test',
    data: null,
  },
  {
    path: '/api/:test/route/:secondTest',
    data: {
      filter: {
        type: String,
        required: true,
      },
      test: {
        type: Array,
        itemsType: [String, Boolean],
        required: true,
      },
    },
  },
];