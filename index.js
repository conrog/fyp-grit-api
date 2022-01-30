const express = require("express");
const app = express();
const port = 3000;
const db = require("./postgres");

const bodyParser = require("body-parser");
const cors = require("cors");

let usersRouter = require("./routes/users");
let workoutsRouter = require("./routes/workouts");
let reccomendationsRouter = require("./routes/recommendations");
const jsonwebtoken = require("jsonwebtoken");

//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.oneOrNone({
      text: "SELECT * FROM grit_user WHERE user_name = $1",
      values: [username],
    });


    if (user && password == user.password) {
      const token = jsonwebtoken.sign(
        {
          userId: user.user_id,
          userName: user.user_name,
        },
        "AbC123",
        {
          expiresIn: "1h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    } else {
      res
        .status(400)
        .send("The username or password you have entered is incorrect.");
    }
  } catch (err) {
    console.log(err);
  }
});

app.use("/users", usersRouter);
app.use("/workouts", workoutsRouter);
app.use("/reccomendations", reccomendationsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
