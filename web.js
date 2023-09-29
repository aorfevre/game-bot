var express = require('express');
var app = express();
const helper = require('./custo/helper.js');
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8508;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
// app.use(express.static(__dirname + '/public'));

// parse the updates to JSON
app.use(express.json());

// // set the home page route
// app.get('/', function(req, res) {
//
//   // ejs render automatically looks in the views folder
//   res.render('index');
// });

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get(`/decode`, (req, res) => {
  const {hash} = req.query;
  if(hash){
    const result = helper.decode(decodeURIComponent(hash));
    if(result){
      res.json(result);

    }else{
      res.sendStatus(400);
    }
  }else{
    res.sendStatus(400);

  }
});



app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});