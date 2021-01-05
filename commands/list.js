const Discord = require('discord.js');
const { get_server_instances } = require('../dbclient.js');

module.exports = {
    name: 'list',
    description: 'Lists all the twitter accounts on the server',
    usage: '$gspn list',
    async execute(message, args) {
        var embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('The following accounts are being posted to:');
        get_server_instances(message.guild.id)
        .then(res => {
            for (instance of res.rows) {
                embed.addField(instance.handle, instance.channels);
            }
            message.channel.send(embed);
        })
        .catch(error => {
            console.log(error)
            message.channel.send('Error: An unknown error has occured.  Try again later.');
        })
    },
};
