let express = require("express");
let router = express.Router();

let userController = require("../controllers/usersController");

router
  .get("/:user_name", userController.get_user_by_username)
  .post("/:user_name", userController.update_user_information)
  .get("/", userController.get_users)
  .post("/", userController.create_user);

module.exports = router;
