let express = require("express");
let router = express.Router();
const auth = require("../middleware/auth");

let workoutsController = require("../controllers/workoutsController");

router
  .use(auth)
  .get("/following", workoutsController.get_following_users_workouts)
  .get("/", workoutsController.get_user_workouts)
  .delete("/:workoutId", workoutsController.delete_workout)
  .post("/new", workoutsController.create_workout)
  .get("/liked", workoutsController.get_liked_workouts)
  .post("/:workoutId/like", workoutsController.like_workout)
  .delete("/:workoutId/like", workoutsController.unlike_workout)
  .put("/:workoutId/edit", workoutsController.edit_workout);

module.exports = router;
