const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Lists all the commands',
    usage: '$gspn help',
    async execute(message, args) {
        var embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('GSPN Commands:');
        for (command of message.client.commands) {
            var description = 'Usage: ' + command[1].usage + '\nDescription: ' + command[1].description;
            embed.addField(command[1].name, description);
        }
        console.log(message.client.commands)
        message.channel.send(embed);
    },
};
