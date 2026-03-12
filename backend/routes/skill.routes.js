const express = require('express');
const router = express.Router();
const { searchSkills, getUniqueSkills } = require('../controllers/skill.controller');

router.get('/unique', getUniqueSkills);
router.get('/search', searchSkills);

module.exports = router;
