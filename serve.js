var express = require('express');
var http = require('http');
var app = express();


app.use(express.static(__dirname));

app.use('/', function(req, res){
  res.sendFile(__dirname + '/index.htm');
});

http.createServer(app).listen(3001);