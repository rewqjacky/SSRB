const channels = ['813660799994036234']
module.exports = {
    name:'摸頭',
    description:"這個一個摸頭指令",
    execute(message, args){
      var messages = ['🌿', '<:666G:824522720477052941>'];
      var rnd = Math.floor(Math.random() * messages.length);
        message.channel.send(messages[rnd]);
    }
}
