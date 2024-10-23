const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { zokou } = require(__dirname + "/../framework/zokou");
const samido = fs.readFileSync(path.resolve(__dirname, './media/menu.mp3'));
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");

const readMore = String.fromCharCode(8206).repeat(4001);

const formatUptime = (seconds) => {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : '',
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : '',
        minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : '',
        remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}` : ''
    ].filter(Boolean).join(', ');
};

const fetchGitHubStats = async () => {
    try {
        const response = await axios.get("https://api.github.com/repos/Keithkeizzah/ALPHA-MD1");
        const forksCount = response.data.forks_count;
        const starsCount = response.data.stargazers_count;
        const totalUsers = forksCount * 2 + starsCount * 2;
        return { forks: forksCount, stars: starsCount, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

zokou({ nomCom: "sing", categorie: "General" }, async (message, reply, config) => {
    const { ms, respond, prefix, senderName } = config;
    const commands = require(__dirname + "/../framework/zokou").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) {
            categorizedCommands[category] = [];
        }
        categorizedCommands[category].push(command.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment();
    const formattedTime = currentTime.format("HH:mm:ss");
    const formattedDate = currentTime.format("DD/MM/YYYY");
    const currentHour = currentTime.hour();
    
    const greetings = ["Good Morning", "Good Afternoon", "Good Evening", "Good Night"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    let responseMessage = `
${greeting}, *${senderName || "User"}*

╭━━━ 〔 𝐀𝐋𝐏𝐇𝐀-𝐌𝐃 〕━━━┈⊷
┃✵╭──────────────
┃✵│▸ *ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
┃✵│▸ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃✵│▸ *ᴛɪᴍᴇ:* ${formattedTime}
┃✵│▸ *ᴅᴀᴛᴇ:* ${formattedDate}
┃✵│▸ *ᴍᴏᴅᴇ:* ${mode}
┃✵│▸ *ᴛɪᴍᴇ ᴢᴏɴᴇ:* Africa/Nairobi
┃✵│▸ *ᴛᴏᴛᴀʟ ᴜsᴇʀs:* ${formattedTotalUsers} users
┃✵│▸ *ʀᴀᴍ:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃✵│▸ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(process.uptime())}
┃✵╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

> 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐊𝐄𝐈𝐓𝐇
`;

    let commandsList = "*𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒*";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    let commandIndex = 1;

    for (const category of sortedCategories) {
        commandsList += `\n*╭──────「 ${category.toUpperCase()} 」────┈⊷*\n│◦➛╭───────────────`;
        const sortedCommands = categorizedCommands[category].sort();
        for (const command of sortedCommands) {
            commandsList += `\n│◦➛ ${commandIndex++}. ${command}`;
        }
        commandsList += "\n│◦➛╰─────────────\n╰──────────────┈⊷\n";
    }

    commandsList += readMore + "\nin honor of Alpha\n";

    try {
        await reply.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: {
                mentionedJid: [senderName],
                externalAdReply: {
                    title: "🌟𝗔𝗟𝗣𝗛𝗔-𝗠𝗗✨",
                    body: "POWERED BY KEITH",
                    thumbnailUrl: "https://files.catbox.moe/09c9r1.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        await reply.sendMessage(message.chat, {
            audio: samido,
            mimetype: 'audio/mpeg'
        }, { quoted: message });
    } catch (error) {
        console.error("Menu error: ", error);
        respond("🥵🥵 Menu error: " + error);
    }
});
