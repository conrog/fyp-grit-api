let express = require("express");
let router = express.Router();
const auth = require("../middleware/auth");

let userController = require("../controllers/usersController");

router
  .use(auth)
  .get("/:user_name", userController.get_user_by_username)
  .post("/:user_name", userController.update_user_information)
  .get("/", userController.get_users)
  .post("/", userController.create_user);

module.exports = router;
