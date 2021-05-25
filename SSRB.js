const fs = require('fs');
const { DISCORD_TOKEN, JOIN_CHANNEL_ID, RULE_CHANNEL_ID, GUIDE_CHANNEL_ID, LOG_CHANNEL_ID } = require('./config.js');
const Discord = require('discord.js');
const { setUncaughtExceptionCaptureCallback } = require('process');
const { Client, MessageEmbed } = require('discord.js');
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });
client.commands = new Discord.Collection();
const prefix = '-';
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
client.on('guildMemberAdd', member => {
    member.guild.channels.cache.get('781156278252208169').send("歡迎"+ member.toString()+ "加入，請先去" + "<#767724012934791168>" + "看一下規則然後拿取你的身份組，" + "<#781159554159345724>"+"這邊有群組內的導覽。")
});
client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();
        if (command === '早安') {
            client.commands.get('早安').execute(message, args);
        } else if (command === '午安') {
            client.commands.get('午安').execute(message, args);
        } else if (command === '晚安') {
            client.commands.get('晚安').execute(message, args);
        }  else if (command.endsWith("機率")) {
            client.commands.get('機率').execute(message, args);
        } else if (command.endsWith("好感度")) {
            client.commands.get('好感度').execute(message, args);
        } else if (command === '抽籤') {
            client.commands.get('抽籤').execute(message, args);
        } else if (command === '摸頭') {
            client.commands.get('摸頭').execute(message, args);
        }
      }
    if (message.content.startsWith('!')) {
        client.commands.get('timeTag').execute(message, Discord);
     } 
});
const advancedPolls = require('./advanced-polls.js');
const memberCounter = require('./counters/member counter.js');
client.once('ready', () => {
    console.log('SSRB is online!');
    memberCounter(client);
    advancedPolls(client);
});
client.on('messageDelete', message => {
    if (message.partial) return;
    const channel = client.channels.cache.get('819165881623773194');
    if (!channel) return;
    const embed = new Discord.MessageEmbed()
        .setTitle('已刪除信息')
        .addField('信息發出者', `${message.author.tag}`)
        .addField('頻道', `${message.channel.name}`)
        .setDescription(message.content)
        .setTimestamp();
    channel.send(embed);
});
const keepAlive = require('./server');
keepAlive();
client.login(DISCORD_TOKEN);
