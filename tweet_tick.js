const { get_all_twitter_accounts, get_channels, update_last_tweet_id } = require('./dbclient.js');
const { get_tweets } = require('./twitterclient.js');
const { send_message } = require('./discordclient.js');

//Debug, stops from cycling
var loop = true;
var on = true;

async function tick () {
    setTimeout(() => {
        console.log('Checking tweets from', new Date().toLocaleString());  
        get_all_twitter_accounts()
        .then(res => {
            for (account of res.rows) {
                post_tweets(account.twitterid, account.handle, account.tweetid);
            }
            if (loop) tick()
        })
        .catch(error => {
            console.error(error);
        });
    }, 60000);
}

function post_tweets (twitter_id, handle, last_tweet_id) {
    var channels, new_tweets;
    get_channels (twitter_id)
    .then(res => {
        channels = res.rows.map(({channelid}) => channelid);
        return get_tweets(handle, 20)
    })
    .then(res => {
        var is_new = true;
        var first_tweet;
        new_tweets = res.map(({ id_str }) => {
            if (!first_tweet) first_tweet = id_str;
            if (last_tweet_id == id_str) is_new = false;
            if (is_new) return `https://twitter.com/${handle}/status/${id_str}`
        })
        .filter(element => {
            if (element) return true;
            else return false;
        });
        for (channel of channels) {
            for (tweet of new_tweets){
                if (on) send_message(channel, tweet);
            }
        }
        update_last_tweet_id(twitter_id, first_tweet);
    })
    .catch(error => {
        console.error(error);
    });
}

module.exports = {
    tick: tick,
};