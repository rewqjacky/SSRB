const { TIME_TAG_CHANNEL_ID, TAG_LOG_CHANNEL_ID, YOUTUBE_APIKEY } = require('../config.js');
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

    async addTag(message, text, time = null) {
        const nowTime = Date.now();

        // get start data
        await this.checkStatus();

        // wait live start
        if (this.status == "upcoming") { return false; }

        // get time
        const startTime = this.startTime;
        const dTime = nowTime - startTime - 12000;
        if (dTime < 0) { return false; }

        // console.log(text, time, dTime)

        let tag = new timeTag(text, time || dTime);
        workingVideo.tagList.push(tag);
        message.guild.channels.cache.get(TAG_LOG_CHANNEL_ID).send(`!set ${parseInt((time || dTime) / 1000)} ${text}`);
        return true;
    }

    output(message) {
        if (this.tagList.length <= 0) { return; }
        let timeLength = 0;
        this.tagList.sort((a, b) => {
            let tA = a.time, tB = b.time;
            if (timeLength == 0 && (tA > 60000 || tB > 60000)) { timeLength = 1; }
            if (timeLength == 1 && (tA > 3600000 || tB > 3600000)) { timeLength = 2; }
            return (tA == tB) ? 0 : (tA > tB) ? 1 : -1;
        })

        // let res = `https://www.youtube.com/watch?v=${this.vID}`;
        let res = `[${this.title}](http://youtu.be/${this.vID})`;
        for (let i = 0; i < this.tagList.length; ++i) {

            let ts = parseInt(this.tagList[i].time / 1000) % 60;
            let tm = parseInt(this.tagList[i].time / 60000) % 60;
            let th = parseInt(this.tagList[i].time / 3600000);

            let fTimeStr = `${ts.toString().padStart(2, '0')}`;
            let fTimeUrl = `${ts.toString().padStart(2, '0')}s`;
            if (tm || timeLength >= 1) {
                fTimeStr = `${tm.toString().padStart(2, '0')}:${fTimeStr}`;
                fTimeUrl = `${tm.toString().padStart(2, '0')}m${fTimeUrl}`;
            }
            if (th || timeLength >= 2) {
                fTimeStr = `${th.toString().padStart(2, '0')}:${fTimeStr}`;
                fTimeUrl = `${th.toString().padStart(2, '0')}h${fTimeUrl}`;
            }

            let newString = `[${fTimeStr}](http://youtu.be/${this.vID}&t=${fTimeUrl})\t${this.tagList[i].text}`;

            // check length
            if (res.length + newString.length <= 2000) {
                res += '\n' + newString;
            } else {
                // too long
                let embed = new Discord.MessageEmbed()
                    .setColor('BLUE')
                    .setTitle(`Tags ${this.vID}`)
                    .setDescription(res)
                message.guild.channels.cache.get(TIME_TAG_CHANNEL_ID).send(embed);

                res = `[${this.title}](http://youtu.be/${this.vID})\n${newString}`;
            }
        }

        let embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle(`Tags ${this.vID}`)
            .setDescription(res)
        message.guild.channels.cache.get(TIME_TAG_CHANNEL_ID).send(embed);

        workingVideo = null;
    }
}
let workingVideo = null;

module.exports = {
    name: 'timeTag',
    description: "timeTag cmd for youtube",
    async execute(message, _Discord) {

        // // debug code
        //     for (let msg of message.content.split('\n')) {
        //         await this.execute2(message, msg, _Discord)
        //     }
        // },
        // async execute2(message, msg, _Discord) {
        // console.log(msg)

        Discord = _Discord;

        // set reply method
        const reply = (msg) => {
            message.channel.send(msg);
        }
        const replyEmoji = (msg) => {
            message.react(msg)
        }

        // get args
        const msg = message.content;
        for (let line of msg.split('\n')) {
            if (!line.startsWith('!')) continue;

            const args = line.slice(1).split(/ +/);
            const cmd = args.shift().toLowerCase();

            if (cmd == 'yt_start') {
                // check arg
                if (args.length <= 0) {
                    reply('> !yt_start youtu.be/tUJ0atwgQ48');
                    continue;
                }

                // check working video
                if (workingVideo != null) {
                    reply(`bot is now watching ${workingVideo.vID}`);
                    continue;
                }

                // check url
                const regUrl = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
                if (!regUrl.test(args[0])) {
                    reply('Unknown url\n> !yt_start youtu.be/tUJ0atwgQ48');
                    continue;
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

                continue;

            } else if (cmd == 'yt_end') {
                // check working video
                if (workingVideo == null) {
                    reply('There is no live on work');
                    continue;
                }

                workingVideo.output(message);
                replyEmoji('🛑');

                continue;

            } else if (cmd == 't') {
                // check working video
                if (workingVideo == null) {
                    reply('There is no live on work');
                    continue;
                }

                // check arg
                let newTag = line.trim().replace(/!t\s+/i, "");
                if (newTag == "") {
                    reply('> !t TAG');
                    continue;
                }

                let r = await workingVideo.addTag(message, newTag);
                if (r) {
                    replyEmoji('👍');
                } else {
                    replyEmoji('♾️');
                }

                continue;

            } else if (cmd == 'adj' || cmd == 'adjust') {
                // check working video
                if (workingVideo == null) {
                    reply('There is no live on work');
                    continue;
                }

                // check arg
                if (args.length <= 0) {
                    reply('> !adjust -10');
                    continue;
                }

                // check time
                const regTime = /[\+\-]?\d+/;
                if (!args[0].match(regTime)) {
                    reply('Unknown time shift\n> !adjust -10');
                    continue;
                }

                let shift = parseInt(args[0]) * 1000;
                let i = workingVideo.tagList.length - 1;
                workingVideo.tagList[i].time += shift;

                message.guild.channels.cache.get(TAG_LOG_CHANNEL_ID).send(`!set ${parseInt((workingVideo.tagList[i].time) / 1000)} ${workingVideo.tagList[i].text}`);

                replyEmoji('👍');

            } else if (cmd == 'set') {
                // check working video
                if (workingVideo == null) {
                    reply('There is no live on work');
                    continue;
                }

                // check arg
                let match = [, timeStr, newTag] = line.match(/^!set\s+(\d+:\d+:\d+|\d+:\d+|\d+)\s+([\s\S]+)$/i)
                if (!match || !timeStr) {
                    reply('> !set hh:mm:ss TAG');
                    continue;
                }
                let th = tm = ts = 0;
                if (match = timeStr.match(/(\d+):(\d+):(\d+)/)) {
                    [, th, tm, ts] = match;
                } else if (match = timeStr.match(/(\d+):(\d+)/)) {
                    [, tm, ts] = match;
                } else if (match = timeStr.match(/(\d+)/)) {
                    [, ts] = match;
                }

                th = parseInt(th || 0);
                tm = parseInt(tm || 0);
                ts = parseInt(ts || 0);


                // console.log(th, tm, ts, newTag);

                let timeInSec = th * 60 * 60 + tm * 60 + ts;
                let r = await workingVideo.addTag(message, newTag, timeInSec * 1000);
                if (r) {
                    replyEmoji('👍');
                } else {
                    replyEmoji('♾️');
                }

                continue;

            } else if (cmd == 'thelp') {
                let res = `開始標記\n> !yt_start youtu.be/tUJ0atwgQ48\n`;
                res += `新增新TAG\n> !t TAG\n`
                res += `修改上一個TAG的秒數\n> !adj -10\n`
                res += `設置新TAG\n> !set hh:mm:ss TAG\n`
                res += `結束標記\n> !yt_end`

                reply(res);
            }
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
