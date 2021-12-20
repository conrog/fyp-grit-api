const db = require("../postgres");

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

exports.get_liked_workouts_by_user_id = (req, res) => {
  db.manyOrNone(
    "SELECT workout_id, workout_name FROM user_liked_workout JOIN workout USING (workout_id) WHERE user_id = $1",
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

  db.one("INSERT INTO user_liked_workout(user_id, workout_id) VALUES($1, $2) RETURNING user_id, workout_id", [
    userId,
    workoutId,
  ])
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

  db.oneOrNone("DELETE FROM user_liked_workout WHERE user_id = $1 AND workout_id = $2 RETURNING user_id", [
    userId,
    workoutId,
  ])
    .then((data) => {
      // console.log(data);
      res.status(200).send({ message: "Delete Successful" });
    })
    .catch((error) => {
      console.log(error);
      res.send("Error");
    });
};
