class ParseRoute {
    constructor(routeData) {
        if (!routeData) throw new Error('Add routeData params');
        if (Array.isArray(routeData)) throw new Error('routeData must be an object');
        if (typeof routeData !== "object") throw new Error('routeData must be an object');

        this.methods = Object.freeze([
            'GET', 
            'HEAD',
            'POST',
            'PUT',
            'DELETE',
            'CONNECT',
            'OPTIONS',
            'TRACE',
            'PATCH'
        ]);
        this.config = { ...routeData };
    };

    parseRoute(req, res, next) {
        const routeDataKeys = Object.keys(this.config).map(key => key.toLocaleUpperCase());
        console.log(routeDataKeys);
    }
}


const l = new ParseRoute({
    get: {
        'api/u/:id': null,
        'api/cards': {
            name: {
                type: String
            },
            children: {
                "/:id": {

                }
            }
        }
    },
    put: ''
});

l.parseRoute();
module.exports = ParseRoute;