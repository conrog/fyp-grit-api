DROP TABLE grit_user CASCADE;
DROP TABLE workout CASCADE;
DROP TABLE user_liked_workout;

CREATE TABLE grit_user(
	user_id INT GENERATED ALWAYS AS IDENTITY,
	user_name TEXT UNIQUE
);
ALTER TABLE grit_user ADD CONSTRAINT pk_user_id PRIMARY KEY(user_id);
-- Additional Fields
ALTER TABLE grit_user ADD COLUMN password TEXT;

CREATE TABLE workout(
	workout_id INT GENERATED ALWAYS AS IDENTITY,
	workout_name TEXT
);
ALTER TABLE workout ADD CONSTRAINT pk_workout_id PRIMARY KEY(workout_id);

CREATE TABLE user_liked_workout(
	user_id INT,
	workout_id INT
);
ALTER TABLE user_liked_workout ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES grit_user(user_id);
ALTER TABLE user_liked_workout ADD CONSTRAINT fk_workout_id FOREIGN KEY (workout_id) REFERENCES workout(workout_id);
ALTER TABLE user_liked_workout ADD CONSTRAINT pk_user_liked_workouts PRIMARY KEY (user_id, workout_id);

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