DROP TABLE grit_user CASCADE;
DROP TABLE workout CASCADE;
DROP TABLE user_liked_workout;

CREATE TABLE grit_user(
	user_id INT GENERATED ALWAYS AS IDENTITY,
	user_name TEXT UNIQUE
);
ALTER TABLE grit_user ADD CONSTRAINT pk_user_id PRIMARY KEY(user_id);
ALTER TABLE grit_user ADD COLUMN password TEXT;
ALTER TABLE grit_user ADD COLUMN first_name TEXT;
ALTER TABLE grit_user ADD COLUMN last_name TEXT;
ALTER TABLE grit_user ADD COLUMN dob DATE;
ALTER TABLE grit_user ADD COLUMN gender TEXT;
ALTER TABLE grit_user ADD COLUMN biography TEXT;
ALTER TABLE grit_user ADD COLUMN is_private BOOLEAN;

CREATE TABLE workout(
	workout_id INT GENERATED ALWAYS AS IDENTITY,
	workout_name TEXT
);
ALTER TABLE workout ADD CONSTRAINT pk_workout_id PRIMARY KEY(workout_id);
-- Refactor Into CREATE statement
ALTER TABLE workout ADD COLUMN user_id INT;
ALTER TABLE workout ADD COLUMN description TEXT;
ALTER TABLE workout ADD COLUMN exercises JSON;
ALTER TABLE workout ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES grit_user(user_id) ON DELETE CASCADE;
ALTER TABLE workout ADD COLUMN start_time TIMESTAMP;

CREATE TABLE user_liked_workout(
	user_id INT,
	workout_id INT
);
ALTER TABLE user_liked_workout ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES grit_user(user_id) ON DELETE CASCADE;
ALTER TABLE user_liked_workout ADD CONSTRAINT fk_workout_id FOREIGN KEY (workout_id) REFERENCES workout(workout_id) ON DELETE CASCADE;
ALTER TABLE user_liked_workout ADD CONSTRAINT pk_user_liked_workouts PRIMARY KEY (user_id, workout_id);

CREATE TABLE follower(
	user_id INT,
	follower_id INT
);
ALTER TABLE follower ADD CONSTRAINT pk_follower PRIMARY KEY(user_id,follower_id);
ALTER TABLE follower ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES grit_user(user_id) ON DELETE CASCADE;
ALTER TABLE follower ADD CONSTRAINT fk_follower_id FOREIGN KEY (follower_id) REFERENCES grit_user(user_id) ON DELETE CASCADE;

CREATE TABLE workout_comment(
	comment_id INT GENERATED ALWAYS AS IDENTITY,
	user_id INT,
	workout_id INT,
	posted_date TIMESTAMP,
	body TEXT
)
ALTER TABLE workout_comment ADD CONSTRAINT pk_workout_comment PRIMARY KEY(comment_id);
ALTER TABLE workout_comment ADD CONSTRAINT fk_workout_comment_user_id FOREIGN KEY (user_id) REFERENCES grit_user(user_id) ON DELETE CASCADE;
ALTER TABLE workout_comment ADD CONSTRAINT fk_workout_commend_workout_id FOREIGN KEY (workout_id) REFERENCES workout(workout_id) ON DELETE CASCADE;

INSERT INTO grit_user(user_name, password) VALUES ('Conor', 'abc123');
INSERT INTO grit_user(user_name, password) VALUES ('Jack', 'abc123');
INSERT INTO grit_user(user_name, password) VALUES ('Michael', 'abc123');

INSERT INTO workout(workout_name) VALUES ('Workout 1: Leg Day');
INSERT INTO workout(workout_name) VALUES ('Workout 2: Upper');
INSERT INTO workout(workout_name) VALUES ('Workout 3: Lower');
INSERT INTO workout(workout_name) VALUES ('Workout 4: Shoulders');
INSERT INTO workout(workout_name) VALUES ('Workout 5: Biceps and Back');
INSERT INTO workout(workout_name) VALUES ('Workout 6: Overhead Press');
INSERT INTO workout(workout_name) VALUES ('Workout 7: Deadlifts and Bench');
INSERT INTO workout(workout_name) VALUES ('Workout 8: Recovery Work');
INSERT INTO workout(workout_name) VALUES ('Workout 9: Bodyweight Workout');
INSERT INTO workout(workout_name) VALUES ('Workout 10: Deltoids and Chest');


INSERT INTO user_liked_workout(user_id, workout_id) VALUES(1,1);
INSERT INTO user_liked_workout(user_id, workout_id) VALUES(1,2);
INSERT INTO user_liked_workout(user_id, workout_id) VALUES(1,3);

INSERT INTO user_liked_workout(user_id, workout_id) VALUES(2,3);
INSERT INTO user_liked_workout(user_id, workout_id) VALUES(2,1);

-- What workouts does user 1 have in common with user 2 
SELECT user_id, workout_id
FROM user_liked_workout
WHERE user_id = 1 AND workout_id IN (
	SELECT workout_id FROM user_liked_workout WHERE user_id = 2
)

SELECT * FROM user_liked_workout WHERE workout_id = 3;

SELECT workout_id, workout_name 
FROM user_liked_workout 
JOIN workout USING (workout_id)
JOIN grit_user USING (user_id)
WHERE user_id = 1;

SELECT * FROM grit_user;
SELECT * FROM workout;
SELECT * FROM user_liked_workout;

SELECT * FROM user_liked_workout WHERE user_id = 11;

SELECT * FROM grit_user;
DELETE FROM grit_user;

-- Get users details 
SELECT user_name, COUNT(workout.workout_id) AS workout_count 
FROM grit_user
LEFT JOIN workout USING(user_id) 
WHERE user_name = 'Conor'
GROUP BY user_name;

-- Search users
SELECT user_name, COUNT(workout.workout_id) FROM grit_user LEFT JOIN workout USING(user_id) WHERE lower(user_name) LIKE '%' || lower('') || '%' GROUP BY user_name;

-- Get Followed Users
SELECT user_name, first_name || ' ' || last_name as name, biography, COUNT(workout.workout_id) AS workout_count, true AS followed
FROM follower 
LEFT JOIN grit_user ON (follower.follower_id = grit_user.user_id)
LEFT JOIN workout ON (workout.user_id = follower.follower_id)
WHERE follower.user_id = 10
GROUP BY user_name, first_name, last_name, biography;

-- Get Users Following Current User
SELECT 
		user_name, first_name || ' ' || last_name as name, 
		biography, 
		COUNT(workout.workout_id) AS workout_count, 
		EXISTS (SELECT * FROM follower WHERE follower_id = grit_user.user_Id AND user_id=10) AS followed 
FROM follower 
LEFT JOIN grit_user ON (follower.user_id = grit_user.user_id) 
LEFT JOIN workout ON (workout.user_id = follower.user_id) 
WHERE follower.follower_id = 10 
GROUP BY user_name, first_name, last_name, biography, grit_user.user_id