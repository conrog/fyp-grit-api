const db = require("../postgres");
const jwt_decode = require("jwt-decode");

exports.get_users = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    let query = req.query.text || "";
    let result = await db.manyOrNone(
      "SELECT user_name, first_name || ' ' || last_name as name, biography, COUNT(workout.workout_id) AS workout_count, EXISTS(SELECT * FROM follower WHERE user_id = $1 AND follower_id = grit_user.user_id ) AS followed FROM grit_user LEFT JOIN workout USING(user_id) WHERE lower(user_name) LIKE '%' || lower($2) || '%' AND grit_user.user_id != $1 AND is_private = false GROUP BY user_name, user_id, first_name, last_name, biography;",
      [userId, query]
    );
    return res.send(result);
  } catch (error) {
    console.log("[GET /users] Error :" + error);
  }
};

exports.get_user_by_username = async (req, res) => {
  const { userName } = jwt_decode(req.headers["authorization"].split(" ")[1]);

  if (userName !== req.params.user_name) {
    try {
      let data = await db.oneOrNone(
        "SELECT user_name, is_private FROM grit_user WHERE user_name = $1",
        req.params.user_name
      );

      if (data === null)
        return res.send({
          message: `User ${req.params.user_name} does not exist.`,
        });
      if (data.is_private) return res.send(data);
    } catch (error) {
      console.log("[GET /user/:user_name] is private Error: " + error);
    }
  }

  try {
    let data = await db.oneOrNone(
      "SELECT user_name, first_name, last_name, TO_CHAR(dob, 'yyyy-mm-dd') AS dob, gender, biography, is_private FROM grit_user WHERE user_name LIKE $1",
      req.params.user_name
    );
    return res.send(data);
  } catch (error) {
    console.log("[GET /user/:user_name] Error: " + error);
  }
};

exports.update_user_information = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    const { firstName, lastName, dob, gender, biography, isPrivate } = req.body;

    await db.query(
      "UPDATE grit_user SET first_name = $1, last_name = $2, dob = $3, gender = $4, biography = $5, is_private = $6 WHERE user_id = $7",
      [firstName, lastName, dob, gender, biography, isPrivate, userId]
    );
    return res.status(204).send({ message: "Profile updated!" });
  } catch (error) {
    console.log("[POST /user/:user_name] Error: " + error);
  }
};

exports.follow_user = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    await db.query(
      "INSERT INTO follower(user_id, follower_id) VALUES($1, (SELECT user_id FROM grit_user WHERE user_name = $2 ))",
      [userId, req.params.user_name]
    );
    return res.status(201).send({ message: "Insert Successful" });
  } catch (error) {
    console.log("[POST /user/:user_name/follow] Error: " + error);
  }
};

exports.unfollow_user = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    const { user_name } = req.params;

    await db.query(
      "DELETE FROM follower WHERE user_id = $1 AND follower_id = (SELECT user_id FROM grit_user WHERE user_name = $2)",
      [userId, user_name]
    );

    return res.status(200).send({ message: "Delete Successful" });
  } catch (error) {
    console.log("[DELETE /user/:user_name/unfollow] Error: " + error);
  }
};

exports.get_user_following = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);

    let result = await db.manyOrNone(
      "SELECT user_name, first_name || ' ' || last_name as name, biography, COUNT(workout.workout_id) AS workout_count, true AS followed FROM follower LEFT JOIN grit_user ON (follower.follower_id = grit_user.user_id) LEFT JOIN workout ON (workout.user_id = follower.follower_id) WHERE follower.user_id = $1 AND is_private = false GROUP BY user_name, first_name, last_name, biography",
      [userId]
    );
    return res.send(result);
  } catch (error) {
    console.log("[GET /user/:user_name/followers] Error: " + error);
  }
};

exports.get_user_followers = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    let result = await db.manyOrNone(
      "SELECT user_name, first_name || ' ' || last_name as name, biography, COUNT(workout.workout_id) AS workout_count, EXISTS (SELECT * FROM follower WHERE follower_id = grit_user.user_Id AND user_id=$1) AS followed FROM follower LEFT JOIN grit_user ON (follower.user_id = grit_user.user_id) LEFT JOIN workout ON (workout.user_id = follower.user_id) WHERE follower.follower_id = $1 AND is_private = false GROUP BY user_name, first_name, last_name, biography, grit_user.user_id",
      [userId]
    );
    return res.send(result);
  } catch (error) {
    console.log("[GET /user/:user_name/following] Error: " + error);
  }
};
