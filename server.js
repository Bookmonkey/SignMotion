var express = require("express");

var server = express();
var router = express.Router();

router.get('/', function(req, res, next){
	res.render('index.html');
});

server.use(express.static(__dirname + "/src"));

server.listen(3000, function(){
	console.log("Sign Motion running on port 3000");
});