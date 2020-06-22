const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Skills = require('../models/skills');
const mongoose = require('mongoose');

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

/* GET Skills page. */
router.get('/skills', function(req, res, next) {
  var back = new Array();
  var front = new Array();
  var db = new Array();
  var etc = new Array();
  
  function backfind(){
    Skills.find({type:'backend'})
    .sort('num')
    .exec(function(err, backlist){
      if(err) return res.json(err);
      back = backlist;
      frontfind();
      });
    };

  function frontfind(){
    Skills.find({type:'frontend'})
    .sort('num')
    .exec(function(err, frontlist){
      if(err) return res.json(err);
      front = frontlist;
      dbfind();
      });
    };

  function dbfind(){
    Skills.find({type:'database'})
    .sort('num')
    .exec(function(err, dblist){
      if(err) return res.json(err);
      db = dblist;
      etcfind();
      });
    };

  function etcfind(){
    Skills.find({type:'etc'})
    .sort('num')
    .exec(function(err, etclist){
      if(err) return res.json(err);
      etc = etclist;
      res.render('./manager/skills', {backend:back, frontend:front, database:db, etc:etc});
      });
    };

    backfind();
});

/* POST 스킬 추가 */
router.post('/skills/add', function(req, res) {
  console.log('도달함');
  console.log(req.body.type);

  let samplefile = req.files.uploadFile;
  var skillname = req.body.skillname.toUpperCase();
  var imgname = req.body.skillname.toLowerCase();
  Skills.create({ skillname:skillname, type:req.body.type, img:imgname}, function(err, post){
    if(err) return console.log(err);
    console.log('DB추가 완료');
  });
  samplefile.mv('./public/skills/'+imgname+'.png', function(err){
    if(err) return res.status(500).send(err);
    console.log('이미지 추가 완료');
  });
  console.log('끝남');
  setTimeout(() => {
    res.redirect('/manager/skills');
  }, 500);
});

/* POST 스킬 순서 변경 */
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

/* POST 스킬 삭제 */
router.post('/skills/delete/:num', function(req, res){
  Skills.deleteOne({num: req.params.num}, function(err){
    if(err) return res.json(err);
    res.redirect('/manager/skills');
  })
})

/* GET About portfolio page. */
router.get('/portfolio', function(req, res) {
  res.render('./manager/portfolio');
});

module.exports = router;
