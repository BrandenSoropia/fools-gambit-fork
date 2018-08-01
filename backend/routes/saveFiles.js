const express = require('express');
const router = express.Router();
const ScoreModel = require('../models/score');
const UserModel = require('../models/user');
const SaveFileModel = require('../models/saveFile');
const isLoggedIn = require('../authentication');

/* Save a user's game data */
router.post('/addSave', isLoggedIn, function(req, res, err) {
  data = req.body;

  SaveFileModel.findOneAndUpdate({userId: req.user},
    {gameState:data.gameState, userId:req.user},
    {upsert:true})
    .then(function() {
          res.send('gameState successfully saved!');
      })
      .catch(function(err) {
          res.status(500).send(err.message);
      })
})


/* Delete's the logged in user's save */
router.delete('/Save', function(req, res, err) {
    data = req.body;
    SaveFileModel.findOneAndRemove({userId: req.user}, function(err,found){
        if (err){
            res.status(500).send(err.message);
        }
        else{
            res.send('players save deleted');
        }
    });

})

/* Get's user's current save file */
router.get('/getSave', isLoggedIn, function(req, res, err) {
    data = req.body;
    SaveFileModel.findOne({userId: req.user}, function(err,found){
        if (err){
            res.status(500).send(err.message);
        }
        if (found){
            res.send(found);
        }
        else{
            res.send('player has no save');
        }
    });

})

module.exports = router;
