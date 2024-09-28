const mongoose = require('mongoose');
const express = require('express');

'use strict';

mongoose.connect(process.env.MONGO_URI);

const issueSchema = new mongoose.Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_on: {type: Date, required: true},
  updated_on: {type: Date, required: true},
  created_by: {type: String, required: true},
  assigned_to: {type: String, required: true},
  open: {type: Boolean, required: true},
  status_text: {type: String, required: true},
  project_name : {type: String, required: true}
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.use(express.urlencoded({ extended: true }))

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
    })
    
    .post(function (req, res){
      let now = new Date();
      console.log(`Received Post request with following parameters:`);
      console.log(req.params.project);
      console.log(req.body);
      
      // make sure necessary params are present
      if ( !(req.body.issue_title && req.body.issue_text && req.body.created_by) ) {
        res.json({
          error: 'required field(s) missing'
        })
      }

      const newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: now,
        updated_on: now,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        open: true,
        status_text: req.body.status_text || "",
        project_name: req.params.project
      })

      newIssue.save();
      res.json(newIssue);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
