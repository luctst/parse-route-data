const { Types } = require('mongoose');

module.exports = {
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