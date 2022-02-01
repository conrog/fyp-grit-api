const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const reccomendationController = require("../controllers/recomendationsController");

router.get("/:userId", auth, reccomendationController.get_recommended_workouts);

module.exports = router;
