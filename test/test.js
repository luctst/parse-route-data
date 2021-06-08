const test = require('ava');
const net = require('net');

const lib = require("../lib/index");
const http = require('../lib/utils/http');

test.before(async function (t) {
    t.context.parser = new lib({
        get: {
            "api/u/:id": null,
            "api/cards": {
                name: {
                    type: String,
                },
                children: {
                    "/:id": {},
                },
            },
        },
        put: {},
    });
    const promise = new Promise(((resolve, reject) => {
        const socket = new net.Socket();

        const onError = () => {
            socket.destroy();
            reject();
        };

        socket.setTimeout(1000);
        socket.once('error', onError);
        socket.once('timeout', onError);

        socket.connect(57084, 'localhost', () => {
            socket.end();
            resolve();
        });
    }));

    try {
        await promise;
        return t.passed;
    } catch (error) {
        return t.fail('You should start express server before running tests');
    }
});

test('First level keys must be http methods', function (t) {
    t.context.parser.httpVerbs.forEach(function (method) {
        if (!http.includes(method)) return t.fail();
    });

    t.pass();
});

test('First level keys must be object',  function (t) {
    const httpMethods = Object.values(t.context.parser.routeConfig);

    httpMethods.forEach(function (value) {
        if (Array.isArray(value)) return t.fail();
        if (typeof value !== 'object') return t.fail();
    });

    t.pass();
});
