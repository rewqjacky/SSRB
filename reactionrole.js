module.exports = {
    name: 'reactionrole',
    description: "Sets up a reaction role message!",
    async execute(message, args, Discord, client) {
        const channel = '767724012934791168';
        const 一般V粉Role = message.guild.roles.cache.find(role => role.name === "一般V粉");
        const 一般V粉Emoji = '🌿';
        let embed = new Discord.MessageEmbed()
            .setColor('#e42643')
            .setTitle('我了解以上規則了!')
            .setDescription('按下面的表情符號拿取你的基本身份組!')
 
        let messageEmbed = await message.channel.send(embed);
        messageEmbed.react(一般V粉Emoji);
 
        client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;
 
            if (reaction.message.channel.id == channel) {
                if (reaction.emoji.name === 一般V粉Emoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(一般V粉Role);
                }
            } else {
                return;
            }
 
        });
    }
}   