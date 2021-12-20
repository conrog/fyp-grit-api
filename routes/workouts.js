let express = require("express");
let router = express.Router();

let workoutsController = require("../controllers/workoutsController");

router.get("/", workoutsController.get_workouts);
router.get("/liked/:userId", workoutsController.get_liked_workouts_by_user_id);
router.post("/:workoutId/like", workoutsController.like_workout);
router.delete("/:workoutId/like", workoutsController.unlike_workout);

module.exports = router;
