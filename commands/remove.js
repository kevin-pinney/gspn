const { validate_handle } = require('../twitterclient.js');
const { remove_twitter_instance } = require ('../dbclient.js');

function remove_account(message, handle, channel) {
    var twitter_id, twitter_handle;
    validate_handle(handle)
    .then(res => {
        [twitter_id, twitter_handle] = res;
        return remove_twitter_instance(message.guild.id, channel.id, twitter_id);
    })
    .then(res => {
        message.channel.send(`Tweets from \'${twitter_handle}\' will no longer be posted to ${channel}`)
    })
    .catch(error => {
        switch(true) {
            case (error && error.error == 1):
                message.channel.send(`Error: \'${twitter_handle}\' is not posting to ${channel}`);
                break;
            case (error && error.code == 50):
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
    name: 'remove',
    description: 'Remove a twitter account listener',
    usage: '$gspn remove <handle> [-c channel]',
    async execute(message, args) {
        var handle = args[0];
        var channel = (args.indexOf('-c') == -1 ? 
            message.channel : 
            parse_channel(message.client, args[args.indexOf('-c') + 1]));
        if(!handle || !channel) {
            message.channel.send(`Error: Usage: \`${this.usage}\``); 
            return;
        }
        remove_account(message, handle, channel);
    },
};
