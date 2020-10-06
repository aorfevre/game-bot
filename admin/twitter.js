var Twitter = require('twitter');

var twitterConf = {
  consumer_key: 'whfQZaykjp4dMfHiBw60nU5Dl',
  consumer_secret: 'CGNlRh023Jh5b5oriHoQFdoScZ7zAXkGFs65T6iEyXWpZ3KYVQ',
  access_token_key: '10809232-crhPPyqrZpsDBPWi7BNqOwCPqKjnXhTHeynY7TvGu',
  access_token_secret: '3OZkUUw5irF5I1uN3zUFIg8CQLLWMFmqLNQLfCtxih409'
}


var params = {
  screen_name: 'nodejs'
};

module.exports.checkTweet = function(id) {
  return new Promise(function(resolve, reject) {
    var client = new Twitter(twitterConf);





    try {

      client.get('statuses/show/' + id, {

      }, function(error, tweet, response) {

        console.log(tweet); // Tweet body.



        resolve(tweet)
      });
    } catch (err) {
      console.log("ERROR ON TWITTER")
      resolve({
        code: 144
      })
    }
  })
}