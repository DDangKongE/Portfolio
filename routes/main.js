var express = require('express');
var router = express.Router();
var fs = require('fs');
const Skills = require('../models/skills');
const Portfolio = require('../models/portfolio');
const mongoose = require('mongoose');
const { json } = require('body-parser');
const { findOne } = require('../models/skills');
const AWS = require('aws-sdk');

/* AWS 셋팅 */
var s3 = new AWS.S3({
  accessKeyId:process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey:process.env.AWS_S3_ACCESS_PW,
  "region":"ap-northeast-2"
});

/* GET home page. */
router.get('/', function(req, res, next) {
  var fileContant = new Array();
  s3.listObjects({Bucket: 'hsm-portfolio', Prefix:'Portfolio/managefile/introduce/'}).on('success', function handlePage(response){
      function readFile(name){
        return new Promise(resolve => {
          s3.getObject({Bucket:'hsm-portfolio', Key:response.data.Contents[name].Key}, function(err, data) {
            resolve(data.Body);
          });
        });
    }

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

    async function loadFile(){
      const fileContant0 = await readFile(0);
      const fileContant1 = await readFile(1);
      const fileContant2 = await readFile(2);
      const fileContant3 = await readFile(3);
      var back = await backfind();
      var front = await frontfind();
      var db = await dbfind();
      var etc = await etcfind();
      var porfol = await portfoliofind();

      res.render('./home/main', {
        achievements : fileContant0 , education : fileContant1 ,  experience : fileContant2 ,  introduce : fileContant3 ,
        backend:back, frontend:front, database:db, etc:etc,
        portfolio:porfol
      });
    }

    loadFile();
  }).send();
});

router.get('/portfolioDetail',function(req, res){
  Portfolio.findOne({index:req.query.index})
  .exec(function(err, data){
    res.send({result:data});
  });
})

module.exports = router;
