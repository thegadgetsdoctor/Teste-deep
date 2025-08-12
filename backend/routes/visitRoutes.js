const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createVisit, getVisits, exitVisit } = require('../controllers/visitController');

router.post('/', auth, createVisit);
router.get('/', auth, getVisits);
router.put('/:id/exit', auth, exitVisit);

module.exports = router;
