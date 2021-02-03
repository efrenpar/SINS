const express = require('express');
const cors = require('cors');
const app = express();
const path = require("path");
var router = express.Router();
const http = require("http");
var server = require('http').Server(app);
const host = 'localhost';
const port = process.env.PORT || 3000;


app.use(cors());

app.use('/css',express.static('css'));
app.use('/fonts',express.static('fonts'));
app.use('/img',express.static('img'));
app.use('/js',express.static('js'));
app.use('/pdf',express.static('pdf'));
app.use('/',router);


router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
  console.log("GET index.html");
});



app.use(function(req, res, next) {
    res.status(404).send("page not found");
    console.error(res.statusCode+"page not found");
  
  });

  
server.listen(port,function() {
  console.log("Server started.......",port);
});
