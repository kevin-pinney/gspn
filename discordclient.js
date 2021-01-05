require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.login(process.env.DISCORD_CLIENT_KEY);
client.once('ready', () => {
    console.log('gspn online')
});

client.on('message', message => {
    if (message.content.substring(0, 5) != '$gspn' || message.author.bot) return;
    var args = message.content.trim().split(/ +/g).filter((token) => {
        return token != '$gspn';
    });
    if (args.length == 0) return;
    var command = args.shift().toLowerCase();
    if(!client.commands.has(command)) {
        message.channel.send('Unknown command.  Use \'$gspn help\' for list of commands.')
        return;
    }
    try {
        client.commands.get(command).execute(message, args)
    } catch(err) {
        console.error(err)
        message.channel.send('There was an issue executing the command.')
    }
});

module.exports = {
    send_message: (channel_id, message) => {
        client.channels.cache.get(channel_id).send(message)
    },
}