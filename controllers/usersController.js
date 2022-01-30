const db = require("../postgres");

exports.get_users = (req, res) => {
  db.manyOrNone("SELECT * FROM grit_user")
    .then((data) => {
      // console.log(data);
      res.send(data);
    })
    .catch((error) => {
      console.log("[GET /users] Error :" + error);
    });
};

exports.get_user_by_username = (req, res) => {
  db.oneOrNone(
    "SELECT user_id, user_name FROM grit_user WHERE user_name = $1",
    req.params.user_name
  )
    .then((data) => {
      if (data === null) {
        res.send(false);
      }
      res.send(data);
    })
    .catch((error) => {
      console.log("[GET /user/:user_name] Error: " + error);
    });
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
