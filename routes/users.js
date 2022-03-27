let express = require("express");
let router = express.Router();

let userController = require("../controllers/usersController");

router.get("/:user_name", userController.get_user_by_username);
router.get("/", userController.get_users);
router.post("/", userController.create_user);

module.exports = router;
