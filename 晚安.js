module.exports = {
    name:'晚安',
    description:"這個一個晚安指令",
    execute(message, args){
        message.channel.send('おやすみなさい!');
    }
}