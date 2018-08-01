const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new mongoose.Schema({ 
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to an id in the collected called "Users"
        required: true, // Every instance of user must have this
    },
    value: Number
});

// Return promise to get top 3 highscores and associated names
scoreSchema.static('getTopThree', function() {
    return this
        .find({})
        .sort({value: 'desc'}) // Sort by descending 
        .limit(3)
        .populate('user_id', 'username')
        .then(function(scores) {
            // Format result to only include the data needed
            return scores.map(function(score) {
                return {
                    name: score.user_id.username,
                    value: score.value
                }
            })
        });
})

// Return promise to get top 3 personal highscores 
scoreSchema.static('getPB', function(user) {
    return this
        .find({'user_id':user})
        .sort({value: 'desc'}) // Sort by descending 
        .limit(3)
        .populate('user_id', 'username')
        .then(function(scores) {
            // Format result to only include the data needed
            return scores.map(function(score) {
                return {
                    name: score.user_id.username,
                    value: score.value
                }
            })
        });
})

const ScoreModel = mongoose.model('Score', scoreSchema);
module.exports = ScoreModel;
