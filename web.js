var express = require("express");
var app = express();
var cors = require("cors");
const helper = require("./custo/helper.js");
const number_guessing = require("./games/number_guessing.js");
const prisoner = require("./games/prisoner.js");
const rock_paper_scissors = require("./games/rock_paper_scissors.js");
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8508;

// set the view engine to ejs
app.set("view engine", "ejs");

// parse the updates to JSON
app.use(express.json());
app.use(cors());

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get(`/decode`, async (req, res) => {
  const { hash } = req.query;
  if (hash) {
    const result = await helper.decode(decodeURIComponent(hash));
    if (result) {
      res.send(result);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
});

app.post(`/play`, async (req, res) => {
  const body = req.body;
  const status = await helper.savePlayTransaction(body.hash, body.txhash);
  if (status) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.get(`/verify/pending-payouts`, async (req, res) => {
  await helper.findAllUnverifiedTransactions();
  res.sendStatus(200);
});

app.get(`/payout/number-guessing`, async (req, res) => {
  await number_guessing.payout();
  res.sendStatus(200);
});

app.get(`/duel/prisoner`, async (req, res) => {
  await prisoner.duel();
  res.sendStatus(200);
});

app.get(`/duel/rockpaperscissors`, async (req, res) => {
  await rock_paper_scissors.duel();
  res.sendStatus(200);
});

app.listen(port, function () {
  console.log("Our app is running on http://localhost:" + port);
});
