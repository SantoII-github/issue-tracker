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
      if (process.env.LOGGING) {
        console.log(`Received Get request for project: ${req.params.project} with query:`);
        console.log(JSON.stringify(req.query));
      }

      const issueList = await Issue.find({
        project_name: req.params.project,
        ...req.query
      }).select('-__v');

      res.json(issueList);
      if (process.env.LOGGING) {
        console.log(`Served ${issueList.length} issues as part of get request`);
      }
    })
    
    .post(function (req, res){
      if (process.env.LOGGING) {
        console.log(`Received Post request with following parameters:`);
        let logObject = structuredClone(req.body);
        logObject.project = req.params.project;
        console.log(logObject);
      }

      let now = new Date();

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
      if (process.env.LOGGING) {
        console.log(`Created issue with id: ${newIssue._id}`);
      }
      res.json(newIssue);
    })
    
    .put(async function (req, res){
      if (process.env.LOGGING) {
        console.log(`Received Put request with following parameters:`);
        let logObject = structuredClone(req.body);
        logObject.project = req.params.project;
        console.log(logObject);
      }

      let project = req.params.project;
      
      if (!req.body._id) {
        res.json({ error: 'missing _id' })
        return;
      } else if (req.body._id.length !== 24) {
        res.json({ error: 'could not update', '_id': req.body._id })
        return;
      } else if (!req.body.issue_title && !req.body.issue_text && !req.body.created_by && !req.body.assigned_to && !req.body.assigned_to && !req.body.status_text && !req.body.open) {
        res.json({ error: 'no update field(s) sent', '_id': req.body._id })
        return;
      }

      const issue = await Issue.findOne({ _id: req.body._id});
      if (issue == null || issue.project_name !== project) {
        res.json({ error: 'could not update', '_id': req.body._id })
        return;
      }
      
      if (req.body.issue_title) {
        issue.issue_title = req.body.issue_title;
      }
      if (req.body.issue_text) {
        issue.issue_text = req.body.issue_text;
      }
      if (req.body.created_by) {
        issue.created_by = req.body.created_by;
      }
      if (req.body.assigned_to) {
        issue.assigned_to = req.body.assigned_to;
      }
      if (req.body.status_text) {
        issue.status_text = req.body.status_text;
      }
      if (req.body.open) {
        issue.open = req.body.open;
      }

      const currentTime = new Date();
      issue.updated_on = currentTime;

      issue.save().then(savedIssue => {
        if (savedIssue !== issue) {
          res.json({ error: 'could not update', '_id': req.body._id });
        } else {
          res.json({  result: 'successfully updated', '_id': req.body._id });
          if (process.env.LOGGING) {
            console.log(`Successfully updated id: ${req.body._id}`)
          }
        }
      })
    })
    
    .delete(async function (req, res){
      if (process.env.LOGGING) {
        console.log(`Received Delete request for project ${req.params.project}, issue ${req.body._id}`);
      }

      let project = req.params.project;
      
      if (!req.body._id) {
        res.json({ error: 'missing _id' })
        return;
      } else if (req.body._id.length !== 24) {
        res.json({ error: 'could not delete', '_id': req.body._id })
        return;
      }

      const deleteOutput = await Issue.deleteOne({ _id: req.body._id });

      if (deleteOutput.acknowledged === true && deleteOutput.deletedCount === 1) {
        res.json({ result: 'successfully deleted', '_id': req.body._id })
        if (process.env.LOGGING) {
          console.log(`Successfully deleted id: ${req.body._id}`)
        }
      } else {
        res.json({ error: 'could not delete', '_id': req.body._id })
      }
    });
    
};
