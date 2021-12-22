const db = require("../postgres");
var Jaccard = require("jaccard-index");
var jaccard = Jaccard();

exports.get_recommended_workouts = (req, res) => {
  const { userId } = req.params;
  let matrix = {};
  let similarities = [];

  db.manyOrNone("SELECT DISTINCT user_id FROM user_liked_workout")
    .then((data) => {
      // Create object lookup which servers as the user-item matrix
      for (let item of data) {
        matrix[item.user_id] = new Array();
      }
      return matrix;
    })
    .then((matrix) => {
      db.manyOrNone("SELECT user_id, workout_id FROM user_liked_workout").then((data) => {
        // Populate the user-item matrix:
        // Key is the user_id and the value is an array of liked workout ids
        data.map((likedWorkout) => {
          matrix[likedWorkout.user_id].push(likedWorkout.workout_id);
        });
        console.log("\nUser-Item Matrix:");
        console.log(matrix);

        // Check if user has liked any workouts in order to generate recomendations
        if (matrix[userId] === undefined) {
          console.log("Error: User: " + userId + " has not liked any workouts ");
          res.send([]);
        } else {
          let user = matrix[userId];
          console.log("\nUser: " + userId + " likes workouts: " + user);
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

          // Sort function to sort by users most similar to userId
          similarities.sort((a, b) => {
            return b.score - a.score;
          });

          // Remove users that are not similar at all to userId (score = 0)
          let similarUsers = similarities.filter((similarity) => similarity.score != 0);
          console.log("\nSimilar Users:");
          console.log(similarUsers);

          //Implement KNN where K = 3 nearest neighbours in terms of similarity
          let K = 3;
          let nearestNeighbours = similarUsers.splice(0, K);
          console.log("\n3 Nearest Neighbours:");
          console.log(nearestNeighbours);

          // Create object with keys equal to workout_ids with an array of similarity scores
          // value is an array of similarity scores of users who have liked the workout of the given key
          // Used to calculate the probability of a user liking a workout
          let likedWorkoutUsersSimilarityScore = nearestNeighbours.reduce((recc, user) => {
            user.workoutsNotLikedBySource.map((workout) => {
              if (recc.hasOwnProperty(workout)) {
                recc[workout].push(user.score);
              } else {
                recc[workout] = [user.score];
              }
            });
            return recc;
          }, {});

          // Calculate Probability that a user will like a workout
          // P(U, W) = sum of simalrity scores of users who like the workout W / amount of likes workout W has recieved
          let probabilityOfLikingWorkout = {};
          for (var workout_id in likedWorkoutUsersSimilarityScore) {
            var sumOfSimilarity = likedWorkoutUsersSimilarityScore[workout_id].reduce((sum, val) => {
              return (sum += val);
            }, 0);

            probabilityOfLikingWorkout[workout_id] =
              sumOfSimilarity / likedWorkoutUsersSimilarityScore[workout_id].length;
          }
          console.log("\nProbability of liking Workouts: ");
          console.log(probabilityOfLikingWorkout);

          let reccomendedWorkoutIds = Object.keys(probabilityOfLikingWorkout);

          if (reccomendedWorkoutIds.length == 0) {
            console.log("No recommendations");
          } else {
            let query = "SELECT * FROM workout WHERE workout_id IN (" + reccomendedWorkoutIds + ")";
            db.manyOrNone(query)
              .then((data) => {
                console.log("\nRecommended Workouts: ");
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
};
