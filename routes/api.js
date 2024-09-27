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

module.exports = function (app) {

  app.use(express.urlencoded({ extended: true }))

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
