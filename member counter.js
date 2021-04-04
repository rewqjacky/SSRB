module.exports = async (client) => {
    const guild = client.guilds.cache.get('716270880493404172');
    setInterval(() =>{
        const memberCount = guild.memberCount;
        const channel = guild.channels.cache.get('819164472089640970');
        channel.setName(`群組人數: ${memberCount.toLocaleString()}`);
        console.log('Updating Member Count');
    }, 5000);
}
