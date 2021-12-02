const { Types } = require('mongoose');

module.exports = {
    get: {
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