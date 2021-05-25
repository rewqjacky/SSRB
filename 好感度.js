const channels = ['813660799994036234']
module.exports = {
    name:'好感度',
    description:"這個一個好感度指令",
    execute(message, args){
         message.channel.send(Math.floor((Math.random() - 0.5) * 200));
    }
}
