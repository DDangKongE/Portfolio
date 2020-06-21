const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Skills = require('../models/skills');
const mongoose = require('mongoose');
const { json } = require('body-parser');

/* GET manager page. */
router.get('/', function(req, res, next) {
  res.render('./manager/main');
});

/* GET ABOUT 페이지 */
router.get('/about', function(req, res, next) {
  
  fs.readdir('./public/introduce/',"utf8", function(e, data){
    var fileContant = new Array();
    var i = 0;
    data.forEach(function(filename){
      
      var fileData = fs.readFileSync('./public/introduce/'+filename, 'utf8')
      fileContant[i] = fileData;
      i = i + 1;
      
    })
    res.render('./manager/about', {achievements : fileContant[0] , education : fileContant[1] ,  experience : fileContant[2] ,  introduce : fileContant[3] });
  });
});

/* POST 자기소개 이미지 수정 */
router.post('/about/upload', function(req, res){
  let samplefile = req.files.uploadFile;

  samplefile.mv('./public/assets/img/about/introduce.jpg', function(err){
    if(err) return res.status(500).send(err);

    res.redirect('/manager/about');
  });
});

/* POST 자기소개 부분 수정 */
router.post('/about/edit/:id', function(req, res){
  fs.writeFile('./public/introduce/'+req.params.id+'.txt', req.body.edit, {encoding: 'utf8'}, function(err){
    if(err) return console.log(err);
  });
  res.redirect('/manager/about');
});

/* GET About skills page. */
router.get('/skills', function(req, res, next) {
  Skills.find({})
  .sort('num')
  .exec(function(err, skilllist){
    if(err) return res.json(err);

    res.render('./manager/skills', {skilllist:skilllist});
  });
});

/* POST 스킬 추가 */
router.post('/skills/add/:id', function(req, res) {
  console.log('도달함');
  Skills.create({type:'backend', skillname:'JS', img:"dsadsa/asdada"}, function(err, post){
    if(err) return console.log(err);
    console.log('에러안남');
  });
  console.log('끝남');
  res.render('./manager/skills');
});

/* POST 순서 변경 */
router.post('/skills/realign', function(req, res) {
  Skills.updateOne({ _id : req.body.firstid}, {num : req.body.second}, function(err, first){
    if(err) return json(err);
  });
  Skills.updateOne({ _id : req.body.secondid}, {num : req.body.first}, function(err, second){
    if(err) return json(err);
  });
  setTimeout(() => {
    res.redirect('./');
  }, 1500);
});

/* GET About portfolio page. */
router.get('/portfolio', function(req, res) {
  res.render('./manager/portfolio');
});

module.exports = router;
