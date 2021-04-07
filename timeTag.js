const { TIME_TAG_CHANNEL_ID, YOUTUBE_APIKEY } = require('../config.js');
let Discord = null;

class timeTag {
    constructor(text = '', time = 0) {
        this.text = text;
        this.time = time;
    }
}

class youtubeVideo {
    constructor(vID) {
        this.vID = vID;
        this.title = '';
        this.startTime = Date.now();
        this.tagList = [];
        this.status = '';
    }

    async init() {
        let data = await getVideoStatus(this.vID);
        this.title = data.snippet.title;
        this.status = data.snippet.liveBroadcastContent;

        if (this.status == "live") {
            this.startTime = Date.parse(data.liveStreamingDetails.actualStartTime);
        } else if (this.status == "upcoming") {
            this.startTime = data.liveStreamingDetails.scheduledStartTime;
        } else if (this.status == "none") {
            this.startTime = Date.now();
        }

        return;
    }

    async checkStatus() {
        let data = await getVideoStatus(this.vID);
        this.title = data.snippet.title;
        this.status = data.snippet.liveBroadcastContent;

        if (this.status == "live") {
            this.startTime = Date.parse(data.liveStreamingDetails.actualStartTime);
        }
    }

    async addTag(text) {
        const nowTime = Date.now();

        // get start data
        await this.checkStatus();

        // wait live start
        if (this.status == "upcoming") { return false; }

        // get time
        const startTime = this.startTime;
        const dTime = nowTime - startTime;
        if (dTime < 0) { return false; }

        let tag = new timeTag(text, dTime);
        workingVideo.tagList.push(tag);
        return true;
    }

    output(message) {
        if (this.tagList.length <= 0) { return; }

        let res = [];
        res.push(`https://www.youtube.com/watch?v=${this.vID}`);
        // res.push(`[Guide](https://discordjs.guide/ 'optional hovertext'`);
        for (let i = 0; i < this.tagList.length; ++i) {

            let fTime = `${parseInt(this.tagList[i].time / 60000)}:${parseInt(this.tagList[i].time / 1000) % 60}`;
            let fTimeUrl = `${parseInt(this.tagList[i].time / 60000)}m${parseInt(this.tagList[i].time / 1000) % 60}s`;

            res.push(`${this.tagList[i].text} [${fTime}](https://www.youtube.com/watch?v=${this.vID}&t=${fTimeUrl})`);
        }
        res = res.join('\n');

        console.log(res);

        let embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle(`Tags ${this.vID}`)
            .setDescription(res)

        message.guild.channels.cache.get(TIME_TAG_CHANNEL_ID)
            .send(embed);

        workingVideo = null;
    }
}
let workingVideo = null;

module.exports = {
    name: 'timeTag',
    description: "timeTag cmd for youtube",
    async execute(message, _Discord) {
        Discord = _Discord;

        // set reply method
        const reply = (msg) => {
            message.channel.send(msg);
        }
        const replyEmoji = (msg) => {
            message.react(msg)
        }

        // get args
        const args = message.content.slice(1).split(/ +/);
        const cmd = args.shift().toLowerCase();

        if (cmd == 'yt_start') {
            // check arg
            if (args.length <= 0) {
                reply('> !yt_start youtu.be/tUJ0atwgQ48');
                return;
            }

            // check working video
            if (workingVideo != null) {
                reply(`bot is now watching ${workingVideo.vID}`);
                return;
            }

            // check url
            const regUrl = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
            if (!regUrl.test(args[0])) {
                reply('Unknown url\n> !yt_start youtu.be/tUJ0atwgQ48');
                return;
            }

            // get video id
            const match = args[0].match(regUrl);
            const vID = match[5];

            // set now working live
            workingVideo = new youtubeVideo(vID);
            await workingVideo.init();

            // reply
            let colorArray = {
                "none": "YELLOW",
                "upcoming": "BLUE",
                "live": "GREEN"
            }
            let color = colorArray[workingVideo.status];
            let embed = new Discord.MessageEmbed()
                .setColor(color)
                .setTitle(`Tags ${workingVideo.vID}`)
                .setDescription(`[${workingVideo.title}](https://www.youtube.com/watch?v=${workingVideo.vID})\nNow ${workingVideo.status}`);
            reply(embed);

            return;

        } else if (cmd == 'yt_end') {
            // check working video
            if (workingVideo == null) {
                reply('There is no live on work');
                return;
            }

            workingVideo.output(message);
            replyEmoji('🛑');

            return;

        } else if (cmd == 't') {
            // check arg
            if (args.length <= 0) {
                reply('> !t TAG');
                return;
            }

            let r = await workingVideo.addTag(args[0]);
            if (r) {
                replyEmoji('👍');
            } else {
                replyEmoji('♾️');
            }

            return;

        } else if (cmd == 'adj' || cmd == 'adjust') {
            // check arg
            if (args.length <= 0) {
                reply('> !adjust -10');
                return;
            }

            // check time
            const regTime = /[\+\-]?\d+/;
            if (!args[0].match(regTime)) {
                reply('Unknown time shift\n> !adjust -10');
                return;
            }

            let shift = parseInt(args[0]) * 1000;
            let i = workingVideo.tagList.length - 1;
            workingVideo.tagList[i].time += shift;

            replyEmoji('👍');

        } else if (cmd == 'thelp') {
            let res = `開始標記\n> !yt_start youtu.be/tUJ0atwgQ48\n`;
            res += `新增TAG\n> !t TAG\n`
            res += `修改上一個標記的秒數\n> !adj -10\n`
            res += `結束標記\n> !yt_end`
            
            reply(res);
        }
    }
}


const request = require('request');
const util = require('util');
const get = util.promisify(request.get);

const getVideoStatus = async (vID) => {

    let url = 'https://www.googleapis.com/youtube/v3/videos';
    let params = {
        part: 'id,snippet,liveStreamingDetails',
        id: vID, key: YOUTUBE_APIKEY
    }
    const req = await get({ url, qs: params });
    // console.log(JSON.stringify(req, null, 2));

    try {
        if (!req.body) return null;

        let result = JSON.parse(req.body);
        if (result.pageInfo.totalResults == 0) return null;

        return result.items[0];
    } catch (e) {

        console.log(e);
        console.log(req.body);
        return null;
    }
}
// const getTimeString = (time) => {
//     return new Date(time).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
// }
