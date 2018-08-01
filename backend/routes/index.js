var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html');
});

router.get('/loggedin', function(req, res, next) {
	if(req.isAuthenticated()){
		res.send(req.user.username);
	}
	else{
		res.send("");
	}

});

module.exports = router;
