const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

client.login(config.BOT_TOKEN);

client.on("message", function (message) {

    const lotteryChannel = client.channels.cache.find(channel => channel.id === "818571392789905458")
    const filter = (reaction, user) => {
        return reaction.emoji.name === "✅" && user.id !== message.author.id
    }
    const collector = message.createReactionCollector(filter, { time: 10000 });

    async function startLottery() {
        let playerList = []
        let newCustomer = message.author
        if (message.channel.id === "818570774763274270") {
            // dm's the person requesting a boost

            message.author.send("Your booking requrest has been processed, an advertiser will be with you shortly.")
            message.delete({ timeout: 1000 })
                .then(msg => console.log(`Deleted message from ${msg.author.username} after 1 second`))
                .catch(console.error);
            // sends the msg to the adv channel and posts the checkmark for the react sign up 
            lotteryChannel.send(`${message.author} has requested a boost react to sign-up `).then(msg => {
                msg.react("✅")
                
                collector.on("collect", (reaction, user) => {
                    console.log(`Collected ${user.tag}`)
                    playerList.push(user.tag)

                })
                collector.on("end", collected => {
                    console.log(playerList)
                    collector.stop()

                })
            })

        }


    }








    startLottery();
});