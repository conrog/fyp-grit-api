let express = require("express");
let router = express.Router();

let loginController = require("../controllers/loginController");

router.post("/", loginController.login);

module.exports = router;
