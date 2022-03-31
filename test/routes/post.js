const mongoose = require('mongoose');

module.exports = [
  {
    path: '/api/room/:uuid/account',
    data: {
      theme: {
        type: String,
        required: true,
        canBe: ['007bff', '6c757d', '28a745', '17a2b8', 'ffc107'],
      },
      roomId: {
        type: String,
        required: true,
        match: /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/,
      },
    },
  },
  {
    path: '/api/array/with/subschema',
    data: {
      data: {
        type: Array,
        itemsType: Object,
        itemsSchema: {
          isCredit: {
            type: Boolean,
            required: true,
          },
          isFieldObjectId: {
            type: Boolean,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          info: {
            type: String,
            maxlength: 75,
          },
          to: {
            type: [mongoose.Types.ObjectId, String],
            required: true,
          },
          from: {
            type: [mongoose.Types.ObjectId, String],
            required: true,
          },
        }
      },
    },
  },
  {
    path: '/operation',
    method: 'post',
    data: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      info: {
        type: String,
        required: true,
        maxLength: 75,
      },
      to: {
        type: [mongoose.Types.ObjectId, String],
        required: true,
      },
      from: {
        type: [mongoose.Types.ObjectId, String],
        required: true,
      },
    },
  },
];