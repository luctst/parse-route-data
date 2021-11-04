module.exports = {
    get: {
        '/:test': null,
        "/api/:test/route/:secondTest": {
            filter: {
                type: String,
                required: true,
            },
            test: {
                type: Array
            }
        }
    },
};