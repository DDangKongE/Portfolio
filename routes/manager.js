const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Skills = require('../models/skills');
const Portfolio = require('../models/portfolio');
const mongoose = require('mongoose');
const util = require('../util');
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const AWS = require('aws-sdk');

/* AWS 셋팅 */
var s3 = new AWS.S3({
  accessKeyId:process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey:process.env.AWS_S3_ACCESS_PW,
  "region":"ap-northeast-2"
});

/* 메인화면 */
/* GET manager page. */
router.get('/', util.isLoggedin, function(req, res, next) {
  res.render('./manager/main');
});


/* 자기소개 */
/* GET ABOUT 페이지 */
router.get('/about', util.isLoggedin, function(req, res, next) {
  var fileContant = new Array();
  s3.listObjects({Bucket: 'hsm-portfolio', Prefix:'Portfolio/managefile/introduce/'}).on('success', function handlePage(response){
      function readFile(name){
        return new Promise(resolve => {
          s3.getObject({Bucket:'hsm-portfolio', Key:response.data.Contents[name].Key}, function(err, data) {
            resolve(data.Body);
          });
        });
    }

    async function loadFile(){
      const fileContant0 = await readFile(0);
      const fileContant1 = await readFile(1);
      const fileContant2 = await readFile(2);
      const fileContant3 = await readFile(3);

      res.render('./manager/about', { achievements : fileContant0 , education : fileContant1 ,  experience : fileContant2 ,  introduce : fileContant3 });
    }

    loadFile();
  }).send();
});

/* POST 자기소개 이미지 수정 */
router.post('/about/upload', util.isLoggedin, function(req, res){
  var param = {
    'Bucket':'hsm-portfolio',
    'Key': 'Portfolio/managefile/introduce.png',
    'ACL': 'public-read',
    'Body': req.files.uploadFile.data
  }

  s3.putObject(param, function(err, data){
    console.log(err);
    console.log(data);
  
    res.redirect('/portfolio/manager/about');

  })
});

/* POST 자기소개 부분 수정 */
router.post('/about/edit/:id', util.isLoggedin, function(req, res){
  var param = {
    'Bucket':'hsm-portfolio',
    'Key': 'Portfolio/managefile/introduce/'+req.params.id+'.txt',
    'ACL': 'public-read',
    'Body': req.body.edit
  }

  s3.putObject(param, function(err, data){
    console.log(err);
    console.log(data);
  
    res.redirect('/portfolio/manager/about');
  })  
});


/* 스킬 */
/* GET Skills page. */
router.get('/skills', util.isLoggedin, function(req, res, next) {
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
router.post('/skills/add', util.isLoggedin, function(req, res) {
  let samplefile = req.files.uploadFile;
  var skillname = req.body.skillname.toUpperCase();
  var imgname = req.body.skillname.toLowerCase();
  Skills.create({ skillname:skillname, type:req.body.type, img:imgname}, function(err, post){
    if(err) return console.log(err);
  });

  var param = {
    'Bucket':'hsm-portfolio',
    'Key': 'Portfolio/managefile/skills/'+imgname+'.png',
    'ACL': 'public-read',
    'Body': samplefile.data
  }

  s3.putObject(param, function(err, data){
    console.log(err);
    console.log(data);
  
    setTimeout(() => {
      res.redirect('/portfolio/manager/skills');
    }, 500);
  })  
});

/* POST 스킬 순서 변경 */
router.post('/skills/realign', util.isLoggedin, function(req, res) {
  Skills.updateOne({ _id : req.body.firstid}, {num : req.body.second}, function(err, first){
    if(err) return json(err);
  });
  Skills.updateOne({ _id : req.body.secondid}, {num : req.body.first}, function(err, second){
    if(err) return json(err);
  });
  setTimeout(() => {
    res.redirect('/portfolio/manager/skills');
  }, 2000);
});

/* POST 스킬 삭제 */
router.post('/skills/delete/:num', util.isLoggedin, function(req, res){
  console.log(req.body);
  Skills.deleteOne({num: req.params.num}, function(err){
    if(err) return res.json(err);
  })
  var param = {
    'Bucket':'hsm-portfolio',
    'Key': 'Portfolio/managefile/skills/'+req.body.imgname+'.png'
  }

  s3.deleteObject(param, function(err, data){
    console.log(err);
    console.log(data);
  
    setTimeout(() => {
      res.redirect('/portfolio/manager/skills');
    }, 500);
  })    
});

/* 포트폴리오 */
/* GET About portfolio page. */
router.get('/portfolio', util.isLoggedin, function(req, res) {
  Portfolio.find()
  .skip(1)
  .sort('index')
  .exec(function(err,data){
    res.render('./manager/portfolio', {list:data});
  });
});

/* 포트폴리오 */
/* GET 포트폴리오 추가 */
router.get('/portfolio/edit', util.isLoggedin, function(req, res) {
  Portfolio.findOne({index:'0'})
  .exec(function(err, data){
    res.render('./manager/portfolio_editor', {index:'0', data:data});
  })
});

/* GET 포트폴리오 수정 */
router.get('/portfolio/edit/:id', util.isLoggedin, function(req, res) {
  Portfolio.findOne({index:req.params.id})
  .exec(function(err, data){
    res.render('./manager/portfolio_editor', {index:req.params.id, data:data});
  })
});

/* POST 포트폴리오 추가 */
router.post('/portfolio/edit', util.isLoggedin, function(req, res) {
  let samplefile = req.files.uploadFile;
  var projectname = req.body.projectname.toLowerCase();
  var imgname = req.body.projectname.replace(/ /gi, "").toLowerCase();

  function addFile(){
    var param = {
      'Bucket':'hsm-portfolio',
      'Key': 'Portfolio/managefile/portfolio/'+imgname+'.png',
      'ACL': 'public-read',
      'Body': samplefile.data
    }
    
    s3.putObject(param, function(err, data){
      console.log(err);
      console.log(data);
      
      setTimeout(() => {
        res.redirect('/portfolio/manager/portfolio');
      }, 1000);
    })  
  }

  if(req.body.index == 0){
    Portfolio.create({ 
      projectname:projectname, projectsubtitle:req.body.projectsubtitle, projectstart:req.body.projectstart, projectend:req.body.projectend, subject:req.body.subject, uselibrary:req.body.uselibrary, projectdetail:req.body.projectdetail, img:imgname
    }, function(err, post){
      if(err) return console.log(err);
      addFile();
    });
  } else {
    Portfolio.updateOne({index:req.body.index},{ 
      projectname:projectname, projectsubtitle:req.body.projectsubtitle, projectstart:req.body.projectstart, projectend:req.body.projectend, subject:req.body.subject, uselibrary:req.body.uselibrary, projectdetail:req.body.projectdetail, img:imgname
    }, function(err, post){
      if(err) return console.log(err);
      s3.deleteObject({'Bucket':'hsm-portfolio','Key': 'Portfolio/managefile/portfolio/'+req.body.olderimg+'.png',}, function(err, data){
        addFile();
      });
    });
  };
});

/* POST 포트폴리오 순서 변경 */
router.post('/portfolio/realign', util.isLoggedin, function(req, res) {
  Portfolio.updateOne({ _id : req.body.firstid}, {index : req.body.second}, function(err, first){
    if(err) return json(err);
  });
  Portfolio.updateOne({ _id : req.body.secondid}, {index : req.body.first}, function(err, second){
    if(err) return json(err);
  });
  setTimeout(() => {
    res.redirect('/portfolio/manager/portfolio');
  }, 2000);
});

/* POST 포트폴리오 삭제 */
router.post('/portfolio/delete/:num', util.isLoggedin, function(req, res){
  console.log(req.body);
  Portfolio.deleteOne({index: req.params.num}, function(err){
    if(err) return res.json(err);
  })
  var param = {
    'Bucket':'hsm-portfolio',
    'Key': 'Portfolio/managefile/portfolio/'+req.body.imgname+'.png'
  }

  s3.deleteObject(param, function(err, data){
    console.log(err);
    console.log(data);
  
    setTimeout(() => {
      res.redirect('/portfolio/manager/portfolio');
    }, 500);
  })    
});

router.get('/login', function(req, res){
  res.render('./manager/login');
})

router.post('/login', passport.authenticate('local', {failureRedirect: '/portfolio/manager/login', failureFlash: true}),function (req, res) {
  res.redirect('/portfolio/manager');
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/portfolio/manager');
});

module.exports = router;
