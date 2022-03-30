const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const exersisesController = require("../controllers/exercisesController");

router.use(auth).get("/", exersisesController.get_exercises);

module.exports = router;
