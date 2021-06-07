const express = require('express');
const chalk = require('chalk');

const testRoutes = require('./routes/test');
const app = express();
const port = process.env.PORT || 57084;

app.use(express.json());
app.use('/test', testRoutes);

app.listen(port, function () {
    process.stdout.write(
        chalk`Express app listening on port {cyan ${port}}`
    );
});