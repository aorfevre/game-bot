var express = require('express');
var app = express();
const checkBalance = require('./custo/checkBalance.js')

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

app.post(`/payment-received`, (req, res) => {
  bot.sendMessage(-1001746527561,'💸💸 New payment received 💸💸')
  res.sendStatus(200);
});

app.get(`/daily-balance`, (req, res) => {
  checkBalance.checkBalanceOnceAday();
  checkBalance.getRadom()

  res.sendStatus(200);
});
app.get(`/new-comer`, (req, res) => {
  bot.sendMessage(-1001746527561, "👍👍👍👍👍👍👍",{reply_to_message_id: 16239})

  res.sendStatus(200);
});




app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});