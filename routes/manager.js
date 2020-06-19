const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');

/* GET manager page. */
router.get('/', function(req, res, next) {
  res.render('./manager/main');
});

/* GET About manager page. */
router.get('/about', function(req, res, next) {
  fs.readFile('./public/introduce/Introduce.txt', 'utf8', function (e, data){
    var introduce = data;  
    fs.readFile('./public/introduce/Achievements.txt', 'utf8', function (e, data){
      var achievements = data;  
        fs.readFile('./public/introduce/Education.txt', 'utf8', function (e, data){
          var education = data;
          fs.readFile('./public/introduce/Experience.txt', 'utf8', function (e, data){
            var experience = data;  
            res.render('./manager/about', {introduce : introduce , achievements : achievements , education : education , experience : experience });
        }); 
      });
    });
  });
});

/* POST About intro image upload */
router.post('/about/upload', function(req, res){
  let samplefile = req.files.uploadFile;

  samplefile.mv('./public/assets/img/about/introduce.jpg', function(err){
    if(err) return res.status(500).send(err);

    res.redirect('/manager/about');
  });
});

router.post('/about/edit/:id', function(req, res){
  fs.writeFile('./public/introduce/'+req.params.id+'.txt', req.body.edit, {encoding: 'utf8'}, function(err){
    if(err) return console.log(err);
  });
  res.redirect('/manager/about');
});

/* GET About skills page. */
router.get('/skills', function(req, res, next) {
  res.render('./manager/skills');
});

/* GET About portfolio page. */
router.get('/portfolio', function(req, res, next) {
  res.render('./manager/portfolio');
});

module.exports = router;
