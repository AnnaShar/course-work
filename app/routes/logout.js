const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.logout();                                 // [1]
    req.session.destroy(() => res.end());         // [2]
});

module.exports = router;