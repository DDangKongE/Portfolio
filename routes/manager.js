const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Skills = require('../models/skills');
const Portfolio = require('../models/portfolio');
const mongoose = require('mongoose');

/* 메인화면 */
/* GET manager page. */
router.get('/', function(req, res, next) {
  res.render('./manager/main');
});


/* 자기소개 */
/* GET ABOUT 페이지 */
router.get('/about', function(req, res, next) {
  
  fs.readdir('./public/managefile/introduce/',"utf8", function(e, data){
    var fileContant = new Array();
    var i = 0;
    data.forEach(function(filename){
      
      var fileData = fs.readFileSync('./public/managefile/introduce/'+filename, 'utf8')
      fileContant[i] = fileData;
      i = i + 1;
      
    })
    res.render('./manager/about', {achievements : fileContant[0] , education : fileContant[1] ,  experience : fileContant[2] ,  introduce : fileContant[3] });
  });
});

/* POST 자기소개 이미지 수정 */
router.post('/about/upload', function(req, res){
  let samplefile = req.files.uploadFile;

  samplefile.mv('./public/managefile/introduce.png', function(err){
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


/* 스킬 */
/* GET Skills page. */
router.get('/skills', function(req, res, next) {
  var back = new Array();
  var front = new Array();
  var db = new Array();
  var etc = new Array();

  function backfind() {
    return new Promise(function(resolve, reject) {
        Skills.find({type:'backend'})
        .sort('num')
        .exec(function(err, backlist){
        if(err) return res.json(err);
        resolve(backlist);
        });
    });
  }

  function frontfind() {
    return new Promise(function(resolve, reject) {
        Skills.find({type:'frontend'})
        .sort('num')
        .exec(function(err, frontlist){
        if(err) return res.json(err);
        resolve(frontlist);
        });
    });
  }

  function dbfind() {
    return new Promise(function(resolve, reject) {
        Skills.find({type:'database'})
        .sort('num')
        .exec(function(err, dblist){
        if(err) return res.json(err);
        resolve(dblist);
        });
    });
  }

  function etcfind() {
    return new Promise(function(resolve, reject) {
        Skills.find({type:'etc'})
        .sort('num')
        .exec(function(err, etclist){
        if(err) return res.json(err);
        resolve(etclist);
        });
    });
  }

  async function loadList(){
    var back = await backfind();
    var front = await frontfind();
    var db = await dbfind();
    var etc = await etcfind();

    res.render('./manager/skills', {backend:back, frontend:front, database:db, etc:etc});
  }

  loadList();
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
  samplefile.mv('./public/img/skills/'+imgname+'.png', function(err){
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
  }, 2000);
});

/* POST 스킬 삭제 */
router.post('/skills/delete/:num', function(req, res){
  Skills.deleteOne({num: req.params.num}, function(err){
    if(err) return res.json(err);
    res.redirect('/manager/skills');
  })
})

/* 포트폴리오 */
/* GET About portfolio page. */
router.get('/portfolio', function(req, res) {
  Portfolio.find()
  .sort('index')
  .exec(function(err,data){
    console.log(data);
    res.render('./manager/portfolio', {list:data});
  });
});

/* 포트폴리오 */
/* GET 포트폴리오 추가 */
router.get('/portfolio/edit', function(req, res) {
  res.render('./manager/portfolio_editor', {index:'0'});
});

/* GET 포트폴리오 수정 */
router.get('/portfolio/edit/:id', function(req, res) {
  res.render('./manager/portfolio_editor', {index:req.params.id});
});

/* POST 포트폴리오 추가 */
router.post('/portfolio/edit', function(req, res) {
  let samplefile = req.files.uploadFile;
  var projectname = req.body.projectname.toLowerCase();
  var imgname = req.body.projectname.toLowerCase();

  function addFile(){
    samplefile.mv('./public/managefile/portfolio/'+imgname+'.png', function(err){
      if(err) return res.status(500).send(err);
      console.log('이미지 추가 완료');
      res.redirect('/manager/portfolio');
    });
  }

  if(req.body.index == 0){
    Portfolio.create({ 
      projectname:projectname, projectstart:req.body.projectstart, projectend:req.body.projectend, subject:req.body.subject, uselibrary:req.body.uselibrary, projectdetail:req.body.projectdetail, img:imgname
    }, function(err, post){
      if(err) return console.log(err);
      console.log('DB추가 완료');
      addFile();
    });
  } else {
    Portfolio.updateOne({ 
      projectname:projectname, projectstart:req.body.projectstart, projectend:req.body.projectend, subject:req.body.subject, uselibrary:req.body.uselibrary, projectdetail:req.body.projectdetail, img:imgname
    }, function(err, post){
      if(err) return console.log(err);
      console.log('DB수정 완료');
      addFile();
    });
  };

});

module.exports = router;
