const db = require("../postgres");
const jwt_decode = require("jwt-decode");

exports.get_user_workouts = async (req, res) => {
  try {
    let username = "";
    if (req.query.username) {
      username = req.query.username;
    } else {
      username = jwt_decode(
        req.headers["authorization"].split(" ")[1]
      ).userName;
    }

    const result = await db.manyOrNone(
      `SELECT user_name, workout_id, workout_name, description, exercises, to_char(start_time, 'DD-MM-YYYY HH24:MI') as start_time FROM grit_user JOIN workout USING (user_id) WHERE grit_user.user_name = $1 ORDER BY start_time DESC`,
      [username]
    );

    res.send(result);
  } catch (error) {
    console.log("[GET /workouts] Error: " + error);
  }
};

exports.get_liked_workouts = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    let result = await db.manyOrNone(
      "SELECT workout_id, workout_name FROM user_liked_workout JOIN workout USING (workout_id) WHERE user_liked_workout.user_id = $1",
      [userId]
    );
    res.send(result);
  } catch (error) {
    console.log("[GET /liked-workouts/:userId] Error: " + error);
  }
};

exports.like_workout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    await db.one(
      "INSERT INTO user_liked_workout(user_id, workout_id) VALUES($1, $2) RETURNING user_id, workout_id",
      [userId, workoutId]
    );
    res.status(201).send({ message: "Liked workout" });
  } catch (error) {
    console.log("[POST /workout/:workoutId/like] Error: " + error);
  }
};

exports.unlike_workout = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    const { workoutId } = req.params;
    await db.oneOrNone(
      "DELETE FROM user_liked_workout WHERE user_id = $1 AND workout_id = $2",
      [userId, workoutId]
    );
    res.status(200).send({ message: "Delete Successful" });
  } catch (error) {
    console.log("[DELETE /workout/:workoutId/like] Error: " + error);
  }
};

exports.create_workout = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    const { name, description, exercises, startTime } = req.body;

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
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    const { workoutId } = req.params;
    await db.result(
      "DELETE FROM workout WHERE user_id = $1 AND workout_id = $2",
      [userId, workoutId]
    );

    res.status(200).send({ message: "Delete Successful" });
  } catch (error) {
    console.log(error);
  }
};

exports.edit_workout = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    const { workoutId } = req.params;
    const { name, description, exercises } = req.body;

    await db.result(
      "UPDATE workout SET workout_name = $1, description = $2, exercises = $3 WHERE workout_id = $4 AND user_id = $5",
      [name, description, JSON.stringify(exercises), workoutId, userId]
    );

    res.status(200).send({ message: "Update Successful" });
  } catch (error) {
    console.log(error);
  }
};
