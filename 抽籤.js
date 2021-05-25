const channels = ['813660799994036234']
module.exports = {
    name:'抽籤',
    description:"這個一個抽籤指令",
    execute(message, args){
      var messages = ['大吉', '中吉', '小吉', '末吉', '兇'];
      var rnd = Math.floor(Math.random() * messages.length);
        message.channel.send(messages[rnd]);
    }
}
