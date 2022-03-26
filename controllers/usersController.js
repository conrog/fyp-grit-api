const db = require("../postgres");

// Todo:
//  - add WHERE user_name is not equal to the user_name passed in jwt

exports.get_users = async (req, res) => {
  try {
    let result = await db.manyOrNone(
      "SELECT user_name, COUNT(workout.workout_id) AS workout_count FROM grit_user LEFT JOIN workout USING(user_id) GROUP BY user_name;"
    );
    res.send(result);
  } catch (error) {
    console.log("[GET /users] Error :" + error);
  }
};

exports.get_user_by_username = async (req, res) => {
  try {
    let data = await db.manyOrNone(
      "SELECT user_name, COUNT(workout.workout_id) FROM grit_user LEFT JOIN workout USING(user_id) WHERE lower(user_name) LIKE '%' || lower($1) || '%' GROUP BY user_name;",
      req.params.user_name
    );
    res.send(data);
  } catch (error) {
    console.log("[GET /user/:user_name] Error: " + error);
  }
};

exports.create_user = (req, res) => {
  let { userName } = req.body;

  db.oneOrNone(
    "INSERT INTO grit_user(user_name) VALUES($1) RETURNING user_id, user_name",
    userName
  ).then((data) => {
    res.status(201).send(data);
  });
};
