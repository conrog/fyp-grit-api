// Rough Work
// Exercises Route
const exercisesList = require("../exercise");
const axios = require("axios");
let exercises = [];

exports.get_exercises = async (req, res) => {
  try {
    console.log(exercises.length);
    if (exercises.length !== 0) {
      console.log("free");
      res.send(exercises);
    } else {
      // Make API call to ExerciseDB
      // const { data } = await axios.get(
      //   "https://exercisedb.p.rapidapi.com/exercises",
      //   {
      //     headers: {
      //       "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      //       "x-rapidapi-key":
      //         "b5c8ebfeddmsha0d9c43a9f37e0fp1b6d88jsnd761628039ea",
      //     },
      //   }
      // );
      // exercises = [...data];
      res.send(exercisesList.exerciseList);
    }
  } catch (e) {
    console.log(e);
  }
};
