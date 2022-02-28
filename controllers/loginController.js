const db = require("../postgres");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.oneOrNone({
      text: "SELECT * FROM grit_user WHERE user_name = $1",
      values: [username],
    });

    // TODO: Remove unecrypted password check at later stage
    if (
      user &&
      (password == user.password ||
        (await bcrypt.compare(password, user.password)))
    ) {
      const token = jsonwebtoken.sign(
        {
          userId: user.user_id,
          userName: user.user_name,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      res.status(200).json({ token });
    } else {
      res
        .status(400)
        .send("The username or password you have entered is incorrect.");
    }
  } catch (err) {
    console.log(err);
  }
};
