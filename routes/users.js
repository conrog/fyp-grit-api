let express = require("express");
let router = express.Router();
const auth = require("../middleware/auth");

let userController = require("../controllers/usersController");

router
  .use(auth)
  .post("/:user_name/follow", userController.follow_user)
  .delete("/:user_name/follow", userController.unfollow_user)
  .get("/:user_name/following", userController.get_user_following)
  .get("/:user_name/followers", userController.get_user_followers)
  .get("/:user_name", userController.get_user_by_username)
  .post("/:user_name", userController.update_user_information)
  .get("/", userController.get_users);

module.exports = router;
