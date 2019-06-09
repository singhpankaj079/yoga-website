var mongoose = require('mongoose');
var Articles = require('./models/article');
var Comments = require('./models/comment');

var data= [ { articles: [ {
	                    title: 'first article',
	                    description: 'first article',
	                    highlight: 'this is first article...',
	                    new: 'yes',
	                    content: 'this is first article',
	                    comments: []

                     }],

              comments:  ]