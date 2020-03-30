/**
 * Created by UKth, department of intelligence on 2017-01-18.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs")


var server = app.listen(process.env.PORT || 5000, function(){
 console.log("Express server has started on port 5000/dynamic")
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var router = require('./router/main')(app,fs);

console.log("Jena is working");
