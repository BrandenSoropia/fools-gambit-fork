const express = require('express');
const router = express.Router();
const ScoreModel = require('../models/score');
const UserModel = require('../models/user');
const isLoggedIn = require('../authentication');
/* Save a user's score. */
router.post('/add', isLoggedIn, function(req, res, err) {
    data = req.body;

    const score = new ScoreModel({
        user_id: req.user,
        value: data.value
    });

    score
        .save()
        .then(function() { // Score saved
            res.send('Score successfully saved!');
        })
        .catch(function(err) { // Report error
            res.status(500).send(err.message);
        })
})

// Get user's personal best score
router.get('/personalbest', function(req, res, err) {
    console.log(req.user);
    ScoreModel 
        .getPB(req.user) // Get user profile associated to high score and append user's name to results
        .then(function(scores) {
            res.send(scores)
        })
})

// Get top 3 highscores and the player names that set it
router.get('/leaderboard', function(req, res, err) {
    ScoreModel
        .count({}) // Count all scores logged
        .then(function(scoreCount) {
            console.log(scoreCount)
            if (scoreCount === 0) { // Set default scores if no scores logged
                const defaultHighScoreUsers = [{
                    username: 'Tigur01',
                }, {
                    username: 'Chimerya',
                }, {
                    username: 'Sansixa',
                }];
                // Create users to use as default high score setters
                UserModel
                    .create(defaultHighScoreUsers)
                    .then(function(users) {
                        // Prepare values to create default high scores
                        const defaultHighScores = users.map(function(user, idx) {
                            const defaultHighScore = {
                                user_id: user._id,
                                value: idx + 3
                            }

                            return defaultHighScore
                        })
                        // Create default high scores
                        ScoreModel
                            .create(defaultHighScores)
                            .then(function() {
                                ScoreModel 
                                .getTopThree() // Get user profile associated to high score and append user's name to results
                                .then(function(scores) {
                                    res.send(scores)
                                })
                            })
                            .catch(function(err) {
                                res.send(500).send(err.message)
                            })
                    .catch(function(err) {
                        res.send(500).send(err.message)
                    })
                })
            } else { // Get top 3 high scores
                ScoreModel 
                    .getTopThree() // Get user profile associated to high score and append user's name to results
                    .then(function(scores) {
                        res.send(scores)
                    })
            }
        })
})


module.exports = router;