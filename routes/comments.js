const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const commentsController = require("../controllers/commentsController");

router
  .use(auth)
  .delete("/:workout_id/:comment_id", commentsController.delete_workout_comment)
  .get("/:workout_id", commentsController.get_workout_comments)
  .post("/:wokrout_id", commentsController.post_workout_comment);

module.exports = router;
