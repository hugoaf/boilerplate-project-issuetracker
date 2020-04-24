/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DATABASE; 

//MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;

      // sanitize search query
      let issue = {};
      if('_id' in req.query ) {
        if(req.query._id.length === 24) {
          issue._id = new ObjectId(req.query._id);
        }
        else res.send("error in _id");
      } 
      if('issue_title' in req.query) issue.issue_title = req.query.issue_title;
      if('issue_text' in req.query) issue.issue_text = req.query.issue_text;
      if('created_by' in req.query) issue.created_by = req.query.issuecreated_by;
      if('created_on' in req.query) issue.created_on = req.query.created_on;
      if('updated_on' in req.query) issue.created_by = req.query.updated_on;
      if('assigned_to' in req.query) issue.assigned_to = req.query.assigned_to;
      if('open' in req.query) { issue.open = String(req.query.open) == "true" }
      if('status_text' in req.query) issue.status_text = req.query.status_text;

      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        let db = client.db("issues");
        var collection = db.collection(project);
        collection.find(issue).toArray(function(err,docs){
          res.json(docs)
        });
      });
    })
    
    .post(function (req, res){

      var project = req.params.project;
      
      //console.log(req.body);

      // required fields
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        res.json({'error': "Missing required fields"});
      } else {

        let issue = {
          issue_title : req.body.issue_title,
          issue_text  : req.body.issue_text,
          created_by  : req.body.created_by,
          created_on  : new Date(),
          updated_on  : new Date(),
          assigned_to : req.body.assigned_to,
          open        : true,
          status_text : req.body.status_text
        }
  
        MongoClient.connect(CONNECTION_STRING, function(err, client) {
          let db = client.db("issues");
          var collection = db.collection(project);
          collection.insertOne(issue, function(err,doc){
            issue._id = doc.insertedId;
            res.json(issue);
          });
        });

      }

    })
    
    .put(function (req, res){
      var project = req.params.project;
      
      // required fields
      if(!req.body._id) {
        res.send("error: missing id");
      } 
      else {
        
        if(
          ! req.body.issue_title &&
          ! req.body.issue_text &&
          ! req.body.created_by &&
          ! req.body.assigned_to &&
          ! req.body.open &&
          ! req.body.status_text
        ) res.send("no updated field sent");

        else {
          let issue = {
            updated_on  : new Date(),
          }
          if(req.body.issue_title) issue.issue_title = req.body.issue_title;
          if(req.body.issue_text) issue.issue_text = req.body.issue_text;
          if(req.body.created_by) issue.created_by = req.body.issuecreated_by_title;
          if(req.body.assigned_to) issue.assigned_to = req.body.assigned_to;
          if(req.body.open) issue.open = !req.body.open;
          if(req.body.status_text) issue.status_text = req.body.status_text;

          MongoClient.connect(CONNECTION_STRING, function(err, client) {
            let db = client.db("issues");
            var collection = db.collection(project);
            collection.findAndModify({_id:new ObjectId(req.body._id)}, [['_id','asc']], {$set: issue}, function(err,doc){
              if(err) {
                res.send("could not update" + req.body._id);
              }
              res.send("successfully updated");

            });
          });

        }

      }
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
      // required fields
      if(!req.body._id) {
        res.send("_id error");
      } 
      else {
        MongoClient.connect(CONNECTION_STRING, function(err, client) {
          let db = client.db("issues");
          var collection = db.collection(project);
          collection.deleteOne({_id: ObjectId(req.body._id)}, function(err,doc){
            if(err) {
              res.send("could not delete" + req.body._id);
            }
            res.send("deleted" + req.body._id);

          });
        });
      }      
    });
    
};
