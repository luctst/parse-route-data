const router = require('express').Router();

router.get('/', function (req, res) {
    res.json({ code: 200 });
})

module.exports = router;