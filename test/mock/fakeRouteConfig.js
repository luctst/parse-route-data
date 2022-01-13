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
    }
  },
  get: {
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