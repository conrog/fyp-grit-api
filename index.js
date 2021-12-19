const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

const app = express();
const port = 3000;

const db = require("./postgres");

var Jaccard = require("jaccard-index");
var jaccard = Jaccard();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/reccomendations/:userId", (req, res) => {
  const { userId } = req.params;
  let matrix = {};
  let similarities = [];

  db.manyOrNone("SELECT DISTINCT user_id FROM user_liked_workout")
    .then((data) => {
      // console.log(data);
      // Create object lookup which servers as the user-item matrix
      for (let item of data) {
        matrix[item.user_id] = new Array();
      }
      return matrix;
    })
    .then((matrix) => {
      db.manyOrNone("SELECT user_id, workout_id FROM user_liked_workout").then((data) => {
        // console.log("data");
        // console.log(data);
        // Populate the user-item matrix:
        // Key is the user_id and the value is an array of liked workout ids
        data.map((likedWorkout) => {
          matrix[likedWorkout.user_id].push(likedWorkout.workout_id);
        });
        console.log("\n User-Item Matrix:");
        console.log(matrix);

        // console.log(matrix[userId]);
        // Check if user has liked any workouts in order to generate recomendations
        if (matrix[userId] === undefined) {
          console.log("Error: User: " + userId + " has not liked any workouts ");
          res.send([]);
        } else {
          let user = matrix[userId];
          console.log("User: " + userId + " likes workouts: " + user);
          // Calculate the similarity value between userId and all users in the user-item matrix
          // Finds the workouts for a given user that userId has not liked
          for (let key in matrix) {
            // Do not need to calculate the similarity of the user defined by the userId value
            if (key == userId) continue;

            // Loop through the matrix, push workout ids not present in the current users liked array
            var workoutsNotLikedBySource = matrix[key].filter((workout) => !matrix[userId].includes(workout));
            similarities.push({
              source: userId,
              target: key,
              score: jaccard.index(user, matrix[key]),
              workoutsNotLikedBySource: workoutsNotLikedBySource,
            });
          }
          // console.log(similarities);

          // Sort function to sort by users most similar to userId
          similarities.sort((a, b) => {
            return b.score - a.score;
          });

          // console.log(similarities);
          // Remove users that are not similar at all to userId (score = 0)
          let similarUsers = similarities.filter((similarity) => similarity.score != 0);
          console.log(similarUsers);

          //Implement KNN 3 nearest neighbours in terms of similarity

          // Create object with keys equal to workout_ids with an array of similarity scores
          // value is an array of similarity scores of users who have liked the workout of the given key
          // let likedWorkoutUsersSimilarityScore;
          let likedWorkoutUsersSimilarityScore = similarUsers.reduce((recc, user) => {
            user.workoutsNotLikedBySource.map((workout) => {
              if (recc.hasOwnProperty(workout)) {
                recc[workout].push(user.score);
              } else {
                recc[workout] = [user.score];
              }
            });
            return recc;
          }, {});
          console.log("workout_id : [similarity score of users who liked workout_id]");
          console.log(likedWorkoutUsersSimilarityScore);

          // Calculate Probability that a user will like a workout
          // P(U, W) = sum of simalrity scores of users who like the workout W / amount of workout W has gotten
          let probabilityOfLikingWorkout = {};
          for (var workout_id in likedWorkoutUsersSimilarityScore) {
            var sumOfSimilarity = likedWorkoutUsersSimilarityScore[workout_id].reduce((sum, val) => {
              return (sum += val);
            }, 0);

            probabilityOfLikingWorkout[workout_id] =
              sumOfSimilarity / likedWorkoutUsersSimilarityScore[workout_id].length;
          }
          console.log(probabilityOfLikingWorkout);

          let reccomendedWorkoutIds = Object.keys(probabilityOfLikingWorkout);
          // console.log(reccomendedWorkoutIds);
          if (reccomendedWorkoutIds.length == 0) {
            console.log("No recommendations");
          } else {
            let query = "SELECT * FROM workout WHERE workout_id IN (" + reccomendedWorkoutIds + ")";
            // console.log(query);
            db.manyOrNone(query)
              .then((data) => {
                console.log(data);
                res.send(data);
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      });
    });
});

//Get Users
app.get("/users", (req, res) => {
  db.manyOrNone("SELECT * FROM test_user")
    .then((data) => {
      // console.log(data);
      res.send(data);
    })
    .catch((error) => {
      console.log("[GET /users] Error :" + error);
    });
});

//Create User
app.post("/user", (req, res) => {
  let { userName } = req.body;

  db.oneOrNone("INSERT INTO test_user(user_name) VALUES($1) RETURNING user_id, user_name", userName).then((data) => {
    // console.log(data);
    res.status(201).send(data);
  });
});

//Check if user exists
app.get("/user/:user_name", (req, res) => {
  db.oneOrNone("SELECT user_id, user_name FROM test_user WHERE user_name = $1", req.params.user_name)
    .then((data) => {
      // console.log(data);
      if (data === null) {
        res.send(false);
      }
      res.send(data);
    })
    .catch((error) => {
      console.log("[GET /user/:user_name] Error: " + error);
    });
});

//Get Workouts
app.get("/workouts", (req, res) => {
  db.manyOrNone("SELECT * FROM workout")
    .then((data) => {
      // console.log(data);
      res.send(data);
    })
    .catch((error) => {
      console.log("[GET /workouts] Error: " + error);
    });
});

//Get liked workouts
app.get("/liked-workouts/:userId", (req, res) => {
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
});

// Add workout like
app.post(`/workout/:workoutId/like`, (req, res) => {
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
});

//Remove a workout like
app.delete("/workout/:workoutId/like", (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
