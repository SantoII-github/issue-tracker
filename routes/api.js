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
  assigned_to: {type: String, required: false},
  open: {type: Boolean, required: true},
  status_text: {type: String, required: false},
  project_name : {type: String, required: true}
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.use(express.urlencoded({ extended: true }))

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      console.log(`Received Get request for project: ${req.params.project}`);

      let project = req.params.project;
      const queryObj = { project_name: project }

      // add created and updated on filter options?

      if (req.query.issue_title) {
        queryObj.issue_title = req.query.issue_title;
      }
      if (req.query.issue_text) {
        queryObj.issue_text = req.query.issue_text;
      }
      if (req.query.created_by) {
        queryObj.created_by = req.query.created_by;
      }
      if (req.query.assigned_to) {
        queryObj.assigned_to = req.query.assigned_to;
      }
      if (req.query.open) {
        queryObj.open = req.query.open;
      }
      if (req.query.status_text) {
        queryObj.status_text = req.query.status_text;
      }
      if (req.query.created_on) {
        queryObj.created_on = new Date(req.query.created_on);
      }
      if (req.query.updated_on_on) {
        queryObj.updated_on = new Date(req.query.updated_on_on);
      }

      const issueList = await Issue.find(queryObj);

      const issueListFormatted = issueList.map( issue => {
        return {
          assigned_to: issue.assigned_to,
          status_text: issue.status_text,
          open: issue.open,
          _id: issue._id,
          issue_title: issue.issue_title,
          issue_text: issue.issue_text,
          created_by: issue.created_by,
          created_on: issue.created_on,
          updated_on: issue.updated_on
        }
      })

      res.json(issueListFormatted);
    })
    
    .post(function (req, res){
      console.log(`Received Post request with following parameters:`);
      console.log(`project: ${req.params.project}`);
      console.log(req.body);

      let now = new Date();

      // make sure necessary params are present
      if ( !req.body.issue_title || !req.body.issue_text || !req.body.created_by ) {
        res.json({
          error: 'required field(s) missing'
        })
        return;
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
