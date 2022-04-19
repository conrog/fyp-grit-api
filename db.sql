DROP TABLE IF EXISTS grit_user CASCADE;
DROP TABLE IF EXISTS workout CASCADE;
DROP TABLE IF EXISTS user_liked_workout;
DROP TABLE IF EXISTS follower;
DROP TABLE IF EXISTS workout_comment;

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
);
ALTER TABLE workout_comment ADD CONSTRAINT pk_workout_comment PRIMARY KEY(comment_id);
ALTER TABLE workout_comment ADD CONSTRAINT fk_workout_comment_user_id FOREIGN KEY (user_id) REFERENCES grit_user(user_id) ON DELETE CASCADE;
ALTER TABLE workout_comment ADD CONSTRAINT fk_workout_commend_workout_id FOREIGN KEY (workout_id) REFERENCES workout(workout_id) ON DELETE CASCADE;
