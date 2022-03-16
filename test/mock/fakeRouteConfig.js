const { Types } = require('mongoose');

module.exports = {
  post: {
    "/api/room/:uuid/account": {
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
    '/api/array/with/subschema': {
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
            type: [Types.ObjectId, String],
            required: true,
          },
          from: {
            type: [Types.ObjectId, String],
            required: true,
          },
        }
      }
    },
  },
  get: {
    '/api/verify/objectid': {
      oid: {
        type: Types.ObjectId,
        required: true,
      }
    },
    '/api/room/:uuid': {
      createSession: {
        type: Boolean,
        default: false,
      }
    },
    '/:test': null,
    "/api/:test/route/:secondTest": {
      filter: {
        type: String,
        required: true,
      },
      test: {
        type: Array,
        itemsType: [String, Boolean],
        required: true,
      },
    }
  },
};