const test = require('ava');
const express = require('express');

const testRoutes = require('./routes/test');

test.before(function (t) {
    t.context.app = express();
    t.context.app.use(express.json());

    t.context.app.use('/test', testRoutes);
});

test.todo("Implement test");
