const UserModel = require('../models/user');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*schema contains a userID as the primary key and their current save information in
the form of a JSON object*/
const gameSchema = new mongoose.Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
    gameState: Object,
});

const GameModel = mongoose.model('GameState', gameSchema);

module.exports = GameModel;
