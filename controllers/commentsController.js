const db = require("../postgres");
const jwt_decode = require("jwt-decode");

exports.get_workout_comments = async (req, res) => {
  try {
    let result = await db.manyOrNone(
      "SELECT user_name, comment_id, to_char(posted_date, 'DD-MM-YYYY HH24:MI') as posted_date, body FROM grit_user JOIN workout_comment USING (user_id) WHERE workout_id = $1 ORDER BY posted_date DESC",
      req.params.workout_id
    );
    res.send(result);
  } catch (error) {
    console.log("[GET /comments/workout_id] Error :" + error);
  }
};

exports.post_workout_comment = async (req, res) => {
  try {
    const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
    const { workout_id, posted_time, body } = req.body;
    await db.one(
      "INSERT INTO workout_comment (user_id, workout_id, posted_date, body) VALUES ($1, $2, $3, $4) RETURNING comment_id",
      [userId, workout_id, posted_time, body]
    );

    res.status(201).send({ message: "Comment has been posted!" });
  } catch (error) {
    console.log("[POST /comments/workout_id] Error :" + error);
  }
};

exports.delete_workout_comment = async (req, res) => {
  try {
    await db.oneOrNone(
      "DELETE FROM workout_comment WHERE workout_id = $1 AND comment_id = $2",
      [req.params.workout_id, req.params.comment_id]
    );
    res.status(200).send({ message: "Delete Successful" });
  } catch (error) {
    console.log("[DELETE /comments/workout_id/comment_id] Error :" + error);
  }
};
