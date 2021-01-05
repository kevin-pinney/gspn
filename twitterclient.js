require('dotenv').config();
const Twitter = require('twitter');
const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
});

module.exports = {
    get_tweets: (handle, count) => {
        return new Promise((resolve, reject) => {
            client.get('statuses/user_timeline', {screen_name:`${handle}`, count:count})
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error[0])
            });
        });
    },
    validate_handle: (handle) => {
        handle.slice(handle.indexOf('@'));
        return new Promise((resolve, reject) => {
            client.get('users/show', {screen_name:`${handle}`})
            .then(data => {
                resolve([data.id_str, data.screen_name]);
            })
            .catch(error => {
                reject(error[0]);
                //resolve([ error, null, null ]);
            });
        });
    },
}
