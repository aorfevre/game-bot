const db = require('./database/mongo');

db.getClient().then((client) => {


  var express = require("express");
  var app = express();
  var cors = require("cors");
  // set the port of our application
  // process.env.PORT lets the port be set by Heroku
  var port = process.env.PORT || 8508;

  // set the view engine to ejs
  app.set("view engine", "ejs");

  // parse the updates to JSON
  app.use(express.json());
  app.use(cors());

  // We are receiving updates at the route below!
  app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  app.get(`/decode`, async (req, res) => {
    const helper = require("./custo/helper.js");

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
    const helper = require("./custo/helper.js");

    const body = req.body;
    const status = await helper.savePlayTransaction(body.hash, body.txhash);
    if (status) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

  app.get(`/verify/pending-payouts`, async (req, res) => {
    const helper = require("./custo/helper.js");

    await helper.findAllUnverifiedTransactions();
    res.sendStatus(200);
  });

  app.get(`/payout/number-guessing`, async (req, res) => {
    const number_guessing = require("./games/number_guessing.js");
    await number_guessing.payout();
    res.sendStatus(200);
  });

  app.get(`/duel/rockpaperscissors`, async (req, res) => {
    const rock_paper_scissors = require("./games/rock_paper_scissors.js");
    await rock_paper_scissors.duel();

    res.sendStatus(200);
  });

  app.get(`/home/stats`, async (req, res) => {
    const helper = require("./custo/helper.js");

    const promises = [];
    promises.push(helper.countGames());
    promises.push(helper.countPlayers());
    promises.push(helper.countPrizePaid());

    const result = await Promise.all(promises);
    res.send([
      { title: result[0], subheading: "Matches played" },
      { title: result[1], subheading: "Players" },
      { title: result[2] + " ETH", subheading: "in Prizes paid out" },
    ]);
  });

  app.listen(port, function () {
    console.log("Our app is running on http://localhost:" + port);
  });

});