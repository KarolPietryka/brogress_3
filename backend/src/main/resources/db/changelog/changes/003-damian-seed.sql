-- Damian: user szldam + exercises + workouts/workout_exercises (from damian_* exports)
INSERT INTO users (nick, password_hash) VALUES ('szldam', 'szldam');

INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Butterfly', 'chest' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Incline Bench Press', 'chest' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Bench Press', 'chest' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Dip', 'chest' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Pull Up', 'back' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Barbell Row', 'back' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Machine Row', 'back' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Squat', 'legs' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Machine Squat', 'legs' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Chin Up', 'arms' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Dumbbell Curl', 'arms' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Triceps Curl', 'arms' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Barbell Overhead Press', 'shoulders' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Machine Overhead Press', 'shoulders' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Dumbbell Overhead Press', 'shoulders' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Lateral Raise', 'shoulders' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Lat Pulldown', 'back' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Leg Raise', 'abs' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Incline Dumbell Press', 'chest' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Smith OHP', 'shoulders' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Barbell burl', 'arms' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Barbell Curl', 'arms' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Rear Delt', 'shoulders' FROM users u WHERE u.nick = 'szldam';
INSERT INTO exercises (user_id, name, body_part) SELECT u.id, 'Triceps na wyciągu', 'arms' FROM users u WHERE u.nick = 'szldam';

-- next workout id after 002-legacy (expects 14); adjust if changelogs differ
INSERT INTO workouts (id, user_id, workout_date)
SELECT 14, u.id, DATE '2026-04-19' FROM users u WHERE u.nick = 'szldam';

INSERT INTO workout_exercises (id, workout_id, body_part, exercise_name, weight, reps, sort_order) VALUES
(144, 14, 'chest', 'Incline Dumbell Press', 60, 16, 0),
(145, 14, 'chest', 'Incline Dumbell Press', 60, 13, 1),
(146, 14, 'back', 'Lat Pulldown', 65, 15, 2),
(147, 14, 'back', 'Lat Pulldown', 65, 13, 3),
(148, 14, 'shoulders', 'Smith OHP', 50, 15, 4),
(149, 14, 'shoulders', 'Smith OHP', 50, 15, 5),
(150, 14, 'arms', 'Barbell Curl', 40, 10, 6),
(151, 14, 'shoulders', 'Lateral Raise', 20, 15, 7),
(152, 14, 'arms', 'Barbell Curl', 40, 10, 8),
(153, 14, 'shoulders', 'Lateral Raise', 20, 15, 9),
(154, 14, 'arms', 'Barbell Curl', 40, 10, 10),
(155, 14, 'shoulders', 'Lateral Raise', 20, 15, 11),
(156, 14, 'shoulders', 'Rear Delt', 50, 20, 12),
(157, 14, 'shoulders', 'Rear Delt', 50, 15, 13),
(158, 14, 'shoulders', 'Rear Delt', 41, 15, 14);

ALTER TABLE workouts ALTER COLUMN id RESTART WITH 15;
ALTER TABLE workout_exercises ALTER COLUMN id RESTART WITH 159;
ALTER TABLE exercises ALTER COLUMN id RESTART WITH 48;
