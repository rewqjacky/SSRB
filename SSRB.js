const Discord = require('discord.js');
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const { Client, MessageEmbed } = require('discord.js');
const keepAlive = require('./server');
const prefix = '-';
const fs = require('fs');
const { setUncaughtExceptionCaptureCallback } = require('process');
const memberCounter = require('./counters/member counter');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('SSRB is online!');
    memberCounter(client);
});

client.on('guildMemberAdd', member => {
    member.guild.channels.cache.get('759720571721482276').send("歡迎" + member.toString() + "加入,你可以去" + "<#805646153597059102>" +"看一下");
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if(command === '早安'){
        client.commands.get('早安').execute(message, args);
    } else if (command === '午安'){
        client.commands.get('午安').execute(message, args);
    } else if (command === '晚安'){
        client.commands.get('晚安').execute(message, args);
    } else if(command ==='reactionrole') {
        client.commands.get('reactionrole').execute(message, args, Discord, client);
    } else if(command.endsWith("機率")) {
        message.channel.send(Math.floor(Math.random() * 100) + "%");
    } else if(command.endsWith("好感度")) {
        message.channel.send(Math.floor((Math.random() - 0.5) * 200));
    }
});

client.on('messageDelete', message => {
    if(!message.partial) {
        const channel = client.channels.cache.get('818813396015251517');
        if(channel) {
            const embed = new MessageEmbed()
            .setTitle('已刪除信息')
            .addField('信息發出者', `${message.author.tag}`)
            .addField('頻道', `${message.channel.name}`)
            .setDescription(message.content)
            .setTimestamp();
        channel.send(embed);    
        }
    }
});


keepAlive();
client.login('ODEzMDg5NTA1MjM4MTg4MDYz.YDKOnA.RT22NjyH11xFx5vJAnbZof4Ke5s');