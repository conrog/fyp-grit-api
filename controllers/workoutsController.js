const db = require("../postgres");
const jwt_decode = require("jwt-decode");

exports.get_workouts = (req, res) => {
  db.manyOrNone("SELECT * FROM workout")
    .then((data) => {
      // console.log(data);
      res.send(data);
    })
    .catch((error) => {
      console.log("[GET /workouts] Error: " + error);
    });
};

//Get user_workouts
exports.get_user_workouts = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);

    const result = await db.manyOrNone(
      `SELECT user_name, workout_id, workout_name, description, exercises, to_char(start_time, 'DD-MM-YYYY HH24:MI') as start_time FROM grit_user JOIN workout USING (user_id) WHERE grit_user.user_id = $1 ORDER BY start_time DESC`,
      [userId]
    );

    res.send(result);
  } catch (error) {
    console.log("[GET /workouts] Error: " + error);
  }
};

exports.get_liked_workouts_by_user_id = (req, res) => {
  db.manyOrNone(
    "SELECT workout_id, workout_name FROM user_liked_workout JOIN workout USING (workout_id) WHERE user_liked_workout.user_id = $1",
    req.params.userId
  )
    .then((data) => {
      // console.log(data);
      res.send(data);
    })
    .catch((error) => {
      console.log("[GET /liked-workouts/:userId] Error: " + error);
    });
};

exports.like_workout = (req, res) => {
  const { userId } = req.body;
  const { workoutId } = req.params;

  db.one(
    "INSERT INTO user_liked_workout(user_id, workout_id) VALUES($1, $2) RETURNING user_id, workout_id",
    [userId, workoutId]
  )
    .then((data) => {
      res.status(201).send({ message: "Liked workout" });
    })
    .catch((error) => {
      console.log("[POST /workout/:workoutId/like] Error: " + error);
      res.send("Error");
    });
};

exports.unlike_workout = (req, res) => {
  const { userId } = req.body;
  const { workoutId } = req.params;

  db.oneOrNone(
    "DELETE FROM user_liked_workout WHERE user_id = $1 AND workout_id = $2",
    [userId, workoutId]
  )
    .then(() => {
      res.status(200).send({ message: "Delete Successful" });
    })
    .catch((error) => {
      console.log(error);
      res.send("Error");
    });
};

exports.create_workout = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    let { name, description, exercises, startTime } = req.body;

    let result = await db.one(
      "INSERT INTO workout (user_id, workout_name, description, exercises, start_time) VALUES ($1, $2, $3, $4, $5) RETURNING workout_id",
      [userId, name, description, JSON.stringify(exercises), startTime]
    );

    res.status(201).send(result);
  } catch (error) {
    console.log(error);
  }
};

exports.delete_workout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    await db.result(
      "DELETE FROM workout WHERE user_id = $1 AND workout_id = $2",
      [userId, workoutId]
    );

    res.status(200).send({ message: "Delete Successful" });
  } catch (error) {
    console.log(error);
  }
};
