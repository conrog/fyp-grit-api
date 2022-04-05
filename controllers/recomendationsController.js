const db = require("../postgres");
const jwt_decode = require("jwt-decode");
var Jaccard = require("jaccard-index");
var jaccard = Jaccard();

exports.get_recommended_workouts = async (req, res) => {
  let matrix = {};
  let similarities = [];
  const { userId } = jwt_decode(req.headers["authorization"].split(" ")[1]);
  try {
    let data = await db.manyOrNone(
      "SELECT DISTINCT user_id FROM user_liked_workout JOIN grit_user USING(user_id) WHERE gender = (SELECT gender FROM grit_user WHERE user_id =$1) AND is_private = false",
      userId
    );
    // Create object lookup which servers as the user-item matrix
    for (let item of data) {
      matrix[item.user_id] = new Array();
    }
  } catch (error) {
    console.log(
      "[GET /recomendations] Error creating user-item matrix: " + error
    );
  }

  // Check if user has liked any workouts in order to generate recomendations
  if (matrix[userId] === undefined) {
    // console.log("Error: User: " + userId + " has not liked any workouts ");
    try {
      let data = await db.manyOrNone(
        "SELECT workout_id,user_name, workout_name, description, exercises, to_char(start_time, 'DD-MM-YYYY HH24:MI') as start_time FROM workout LEFT JOIN grit_user USING(user_id) WHERE user_id != $1 AND grit_user.gender = (SELECT gender FROM grit_user WHERE user_id = $1) AND is_private = false ORDER BY random()  LIMIT 10;",
        userId
      );
      return res.send(data);
    } catch (error) {
      console.log(
        "[GET /recomendations] Error Returning Random Workouts: " + error
      );
    }
  }

  try {
    let data = await db.manyOrNone(
      "SELECT user_id, workout_id FROM user_liked_workout JOIN grit_user USING (user_id) WHERE is_private = false"
    );

    // Populate the user-item matrix:
    // Key is the user_id and the value is an array of liked workout ids
    data.map((likedWorkout) => {
      matrix[likedWorkout.user_id].push(likedWorkout.workout_id);
    });
    // console.log("\nUser-Item Matrix:");
    // console.log(matrix);
  } catch (error) {
    console.log(
      "[GET /recomendations] Error populating user-item matrix: " + error
    );
  }

  let user = matrix[userId];
  // console.log("\nUser: " + userId + " likes workouts: " + user);
  // Calculate the similarity value between userId and all users in the user-item matrix
  // Finds the workouts for a given user that userId has not liked
  for (let key in matrix) {
    // Do not need to calculate the similarity of the user defined by the userId value
    if (key == userId) continue;

    // Loop through the matrix, push workout ids not present in the current users liked array
    var workoutsNotLikedBySource = matrix[key].filter(
      (workout) => !matrix[userId].includes(workout)
    );
    similarities.push({
      source: userId,
      target: key,
      score: jaccard.index(user, matrix[key]),
      workoutsNotLikedBySource: workoutsNotLikedBySource,
    });
  }
  // console.log("----similarities---");
  // console.log(similarities);
  // Sort function to sort by users most similar to userId
  similarities.sort((a, b) => {
    return b.score - a.score;
  });

  // Remove users that are not similar at all to userId (score = 0)
  let similarUsers = similarities.filter((similarity) => similarity.score != 0);
  // console.log("\nSimilar Users:");
  // console.log(similarUsers);

  //KNN where K = 5 nearest neighbours in terms of similarity
  let K = 5;
  let nearestNeighbours = similarUsers.splice(0, K);
  // console.log("\n5 Nearest Neighbours:");
  // console.log(nearestNeighbours);

  // Create object with keys equal to workout_ids with an array of similarity scores
  // value is an array of similarity scores of users who have liked the workout of the given key
  // Used to calculate the probability of a user liking a workout
  let likedWorkoutUsersSimilarityScore = nearestNeighbours.reduce(
    (recc, user) => {
      user.workoutsNotLikedBySource.map((workout) => {
        if (recc.hasOwnProperty(workout)) {
          recc[workout].push(user.score);
        } else {
          recc[workout] = [user.score];
        }
      });
      return recc;
    },
    {}
  );

  // Calculate Probability that a user will like a workout
  // P(U, W) = sum of simalrity scores of users who like the workout W / amount of likes workout W has recieved
  let probabilityOfLikingWorkout = {};
  for (var workout_id in likedWorkoutUsersSimilarityScore) {
    var sumOfSimilarity = likedWorkoutUsersSimilarityScore[workout_id].reduce(
      (sum, val) => {
        return (sum += val);
      },
      0
    );

    probabilityOfLikingWorkout[workout_id] =
      sumOfSimilarity / likedWorkoutUsersSimilarityScore[workout_id].length;
  }
  // console.log("\nProbability of liking Workouts: ");
  // console.log(probabilityOfLikingWorkout);

  let reccomendedWorkoutIds = Object.keys(probabilityOfLikingWorkout);

  //Add some random workouts to fill reccomendations if not enough ids are returned
  if (reccomendedWorkoutIds.length < 10) {
    try {
      let data = await db.query(
        "SELECT workout_id FROM workout LEFT JOIN grit_user USING(user_id) WHERE user_id != $1 AND grit_user.gender = (SELECT gender FROM grit_user WHERE user_id = $1) AND is_private = false ORDER BY random() LIMIT $2",
        [userId, 10 - reccomendedWorkoutIds.length]
      );

      for (let id of data) {
        reccomendedWorkoutIds.push(id.workout_id);
      }

      let query =
        "SELECT workout_id,user_name, workout_name, description, exercises, to_char(start_time, 'DD-MM-YYYY HH24:MI') as start_time FROM workout LEFT JOIN grit_user USING(user_id) WHERE workout_id IN (" +
        reccomendedWorkoutIds +
        ") ORDER BY start_time DESC";
      data = await db.query(query);

      return res.send(data);
    } catch (error) {
      console.log(
        "[GET /recomendations] Error returning recommended workouts: " + error
      );
    }
  } else {
    try {
      let query =
        "SELECT workout_id,user_name, workout_name, description, exercises, to_char(start_time, 'DD-MM-YYYY HH24:MI') as start_time FROM workout LEFT JOIN grit_user USING(user_id) WHERE workout_id IN (" +
        reccomendedWorkoutIds +
        ") ORDER BY start_time DESC";
      let data = await db.manyOrNone(query);

      return res.send(data);
    } catch (error) {
      console.log(
        "[GET /recomendations] Error returning recommended workouts: " + error
      );
    }
  }
};
