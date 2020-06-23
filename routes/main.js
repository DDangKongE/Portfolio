var express = require('express');
var router = express.Router();
var fs = require('fs');
const Skills = require('../models/skills');
const Portfolio = require('../models/portfolio');
const mongoose = require('mongoose');
const { json } = require('body-parser');
const { findOne } = require('../models/skills');

/* GET home page. */
router.get('/', function(req, res, next) {
  //자기소개 불러오기
  fs.readdir('./public/managefile/introduce/',"utf8", function(e, data){
    var fileContant = new Array();
    var i = 0;
    data.forEach(function(filename){
      
      var fileData = fs.readFileSync('./public/managefile/introduce/'+filename, 'utf8')
      fileContant[i] = fileData;
      i = i + 1;
      
    })

  // 스킬 리스트 불러오기
  var back = new Array();
  var front = new Array();
  var db = new Array();
  var etc = new Array();
  var portfolio = new Array();

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

  function portfoliofind() {
    return new Promise(function(resolve, reject) {
        Portfolio.find()
        .skip(1)
        .sort('index')
        .exec(function(err, portfoliolist){
        if(err) return res.json(err);
        resolve(portfoliolist);
        });
    });
  }

  async function loadList(){
    var back = await backfind();
    var front = await frontfind();
    var db = await dbfind();
    var etc = await etcfind();
    var porfol = await portfoliofind();


    res.render('./home/main', {
        achievements : fileContant[0] , education : fileContant[1] ,  experience : fileContant[2] ,  introduce : fileContant[3] ,
        backend:back, frontend:front, database:db, etc:etc,
        portfolio:porfol
      });
  }
  
  loadList();
  
  });
});

router.get('/portpolioDetail',function(req, res){
  Portfolio.findOne({index:req.query.index})
  .exec(function(err, data){
    res.send({result:data});
  });
})

module.exports = router;
