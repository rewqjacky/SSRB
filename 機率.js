const channels = ['813660799994036234']
module.exports = {
    name:'機率',
    description:"這個一個機率指令",
    execute(message, args){
       message.channel.send(Math.floor(Math.random() * 100) + "%");
    }
}
