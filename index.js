const express = require("express");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const cors = require("cors");

let usersRouter = require("./routes/users");
let workoutsRouter = require("./routes/workouts");
let reccomendationsRouter = require("./routes/recommendations");

//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/users", usersRouter);
app.use("/workouts", workoutsRouter);
app.use("/reccomendations", reccomendationsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
