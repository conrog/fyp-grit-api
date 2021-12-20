let express = require("express");
let router = express.Router();

let reccomendationController = require("../controllers/recomendationsController");

router.get("/:userId", reccomendationController.get_recommended_workouts);

module.exports = router;
