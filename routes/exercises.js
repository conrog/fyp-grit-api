let express = require("express");
let router = express.Router();
const auth = require("../middleware/auth");

let exersisesController = require("../controllers/exercisesController");

router.use(auth).get("/", exersisesController.get_exercises);

module.exports = router;
