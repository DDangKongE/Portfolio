var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile('./public/introduce/Introduce.txt', 'utf8', function (e, data){
    var introduce = data;  
    fs.readFile('./public/introduce/Achievements.txt', 'utf8', function (e, data){
      var achievements = data;  
        fs.readFile('./public/introduce/Education.txt', 'utf8', function (e, data){
          var education = data;
          fs.readFile('./public/introduce/Experience.txt', 'utf8', function (e, data){
            var experience = data;  
            res.render('./home/main', {introduce : introduce , achievements : achievements , education : education , experience : experience });
        }); 
      });
    });
  });
});

module.exports = router;
