const Discord = require("discord.js");
const config = require("./config.json");

const bot = new Discord.Client();

bot.login(config.BOT_TOKEN);
let lotteryChannelID = "CHANGE THIS VALUE";
let triggerChannelID = "CHANGE THIS VALUE";


bot.on("message", (async msg => {
    const lotteryChannel = bot.channels.cache.find(channel => channel.id === lotteryChannelID);
    const triggerChannel = triggerChannelID;
    if (msg.author.bot || msg.channel.id !== triggerChannel) return;
    await initialConversation(msg, triggerChannel);
    await deleteMsg(msg);
    notifyChannel(msg, lotteryChannel,bot);

}));

function initialConversation(message) {
    message.author.send("Your booking request has been processed, an advertiser will be with you shortly.");
}

function deleteMsg(message) {
    message.delete({
            timeout: 500
        })
        .then(msg => {
            console.log(`Deleted message from ${msg.author.username} after .5 seconds`)}
            )
        .catch(console.error);
}

async function notifyChannel(message, destChannel,bot) {
    if (message.author.bot) return;
    let players = [];
    let requestorObject = {
        "messageID": message.author.id,
        "messageContent": message.content
    }
    let returnObj = {
        "requestor": requestorObject,
        "selectedAdvertiserID": ''
    };
    const filter = (user) => {
        return (user.id !== message.author.id);
    }
    await destChannel.send(`${message.author} has requested a boost react to sign-up `).then(async msg => {

        await msg.react("✅");

        const collector = msg.createReactionCollector(filter, {
            time: 10000
        });

        collector.on('collect', (reaction, user) => {
            if(!(players.includes(user.id))){
                players.push(user.id);
            }
        });

        collector.on('end', collect => {
            shuffle(players);
            returnObj["selectedAdvertiserID"] = shuffle(players).shift();
            messageWinners(returnObj,bot);
        });
    });
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

async function messageWinners(winnersObject) {
    
    let originalRequestor = await bot.users.fetch(winnersObject["requestor"].messageID);
    let selectedAdvertiser = await bot.users.fetch(winnersObject["selectedAdvertiserID"]);

    selectedAdvertiser.send(`You have been selected to help ${originalRequestor} with the request of: \n ${winnersObject["requestor"].messageContent}`);
    originalRequestor.send(`${selectedAdvertiser} has been selected to assist you with your boost request. Please ensure within your Privacy & Safety settings you are allowing direct messages from server members!`);
}