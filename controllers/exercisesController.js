const axios = require("axios");
let exercises = [];

exports.get_exercises = async (req, res) => {
  try {
    if (exercises.length !== 0) {
      return res.send(exercises);
    } else {
      // Make API call to ExerciseDB
      const { data } = await axios.get(
        "https://exercisedb.p.rapidapi.com/exercises",
        {
          headers: {
            "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
            "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          },
        }
      );
      exercises = [...data];

      return res.send(data);
    }
  } catch (error) {
    console.log("[GET /exercises] Error :" + error);
  }
};
