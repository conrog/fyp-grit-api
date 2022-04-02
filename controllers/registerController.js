const db = require("../postgres");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const exisitingUser = await db.oneOrNone(
      "SELECT user_id FROM grit_user WHERE user_name = $1",
      [username]
    );

    if (exisitingUser != null) {
      return res
        .status(200)
        .send({ inUse: true, message: "Username already in use." });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.oneOrNone(
      "INSERT into grit_user (user_name, password, is_private) VALUES ($1, $2, false) RETURNING user_id, user_name",
      [username, encryptedPassword]
    );

    const token = jsonwebtoken.sign(
      {
        userId: newUser.user_id,
        userName: newUser.user_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).send({ token });
  } catch (error) {
    console.log(error);
  }
};
