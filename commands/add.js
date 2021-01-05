const { get_tweets, validate_handle } = require('../twitterclient.js');
const { add_twitter_account, add_twitter_instance, add_guild, add_channel, update_last_tweet_id } = require ('../dbclient.js');

function add_account(message, handle, channel) {
    var twitter_id, twitter_handle;
    validate_handle(handle)
    .then(res => {
        [twitter_id, twitter_handle] = res;
        return add_channel(channel.id, channel.name);
    })
    .then(res => {
        return add_guild(message.guild.id, message.guild.name);
    })
    .then(res => {
        return add_twitter_account(twitter_id, twitter_handle, twitter_id);
    })
    .then(res => {
        return add_twitter_instance(message.guild.id, channel.id, twitter_id);
    })
    .then(res => {
        if (res.command == 'SELECT') {
            message.channel.send(`Tweets from \'@${twitter_handle}\' are already being posted to ${channel}.`);
        } else {
            message.channel.send(`Now posting tweets from \'@${twitter_handle}\' to ${channel}`);
        }
        return get_tweets(twitter_handle, 1);
    })
    .then(res => {
        return update_last_tweet_id(twitter_id, res[0].id_str);
    })
    .catch(error => {
        switch(true) {
            case (error.code == 50):
                message.channel.send('Error: Please enter a valid handle.')
                break;
            default:
                message.channel.send('Error: An unknown error has occured.  Try again later.');
                console.error(error);
                break;
        }
    });
}

function parse_channel(client, channel_text) {
    if (channel_text.match(/<#[0-9]+>/g)) {
        return client.channels.cache.get(channel_text.substring(0, channel_text.length - 1).slice(2))
    }
    for (channel of client.channels.cache) {
        if (channel[1].name == channel_text) return channel[1];
    }
}

module.exports = {
    name: 'add',
    description: 'Add a new twitter account listener',
    usage: '$gspn add <handle> [-c channel]',
    async execute(message, args) {
        var handle = args[0];
        var channel = (args.indexOf('-c') == -1 ? 
            message.channel : 
            parse_channel(message.client, args[args.indexOf('-c') + 1]));
        if(!handle || !channel) {
            message.channel.send(`Error: Usage: \`${this.usage}\``); 
            return;
        }
        add_account(message, handle, channel);
    },
};
