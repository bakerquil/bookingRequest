const Discord = require("discord.js");
const config = require("./config.json");

const bot = new Discord.Client();

bot.login(config.BOT_TOKEN);

bot.on("message", (async msg => {
    const lotteryChannel = bot.channels.cache.find(channel => channel.id === "733683187649347614");
    const triggerChannel = '273624137530867712';
    await initialConversation(msg, triggerChannel);
    await deleteMsg(msg, triggerChannel);
    notifyChannel(msg, lotteryChannel);

}));

function initialConversation(message, triggerChannel) {
    console.log("initialConversation")
    if (message.author.bot) return;
    return message.channel.id === triggerChannel ? message.author.send("Your booking requrest has been processed, an advertiser will be with you shortly.") : "";
}

function deleteMsg(message, triggerChannel) {
    console.log("deleteMsg")
    return message.channel.id === triggerChannel ? message.delete({
            timeout: 1000
        })
        .then(msg => console.log(`Deleted message from ${msg.author.username} (id = ${msg.author.id})after 1 second`))
        .catch(console.error) : "";
}

async function notifyChannel(message, destChannel) {
    console.log("notifyChannel")
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
            time: 5000
        });

        collector.on('collect', (reaction, user) => {
            console.log(user.id);
            players.push(user.id);
        });

        collector.on('end', collect => {
            console.log("in collector on")
            shuffle(players);
            returnObj["selectedAdvertiserID"] = shuffle(players).shift();
            messageWinners(returnObj);
        });
    });
}

function shuffle(array) {
    console.log("shuffle")
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

function messageWinners(winnersObject) {
    console.log("messageWinners")
    let selectedAdvertiser = winnersObject["selectedAdvertiserID"];
    let originalRequestor = winnersObject["requestor"];

    selectedAdvertiser.send(`You have been selected to help ${originalRequestor.messageID} with the request of: ${originalRequestor.messageID}`);
    originalRequestor.send(`${selectedAdvertiser} has been selected to assist you with your boost request. Please ensure within your Privacy & Safety settings you are allowing direct messages from server members!`);
}