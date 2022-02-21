//TODO:
// Make Register Route
// Add encryption to passwords
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.SERVER_PORT;

const bodyParser = require("body-parser");
const cors = require("cors");

const usersRouter = require("./routes/users");
const workoutsRouter = require("./routes/workouts");
const reccomendationsRouter = require("./routes/recommendations");
const loginRouter = require("./routes/login");

//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/workouts", workoutsRouter);
app.use("/reccomendations", reccomendationsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
