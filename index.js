require('dotenv').config()
const { Client } = require('discord.js-selfbot-v13')
const client = new Client()

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)

    // Fetch both channels
    const channel1 = await client.channels.fetch(process.env.BUMP_CHANNEL_1)
    const channel2 = await client.channels.fetch(process.env.BUMP_CHANNEL_2)
    
    async function bump(channel, serverName) {
        await channel.sendSlash('302050872383242240', 'bump')
        // console.count(`Bumped ${serverName}!`)
    }

    function loop(channel, serverName) {
        // send bump message every 2-3 hours, to prevent detection.
        var randomNum = Math.round(Math.random() * (9000000 - 7200000 + 1)) + 7200000
        setTimeout(function () {
            bump(channel, serverName)
            loop(channel, serverName)
        }, randomNum)
    }
    
    // Start bumping server 1
    bump(channel1, 'Server 1')
    loop(channel1, 'Server 1')
    
    // Add a delay of 5-15 minutes before starting server 2 bumps
    const delayMinutes = Math.floor(Math.random() * 1) + 5; // Random 5-1 minutes
    const delayMilliseconds = delayMinutes * 60 * 1000;
    
    // console.log(`Will start bumping Server 2 in ${delayMinutes} minutes`)
    
    setTimeout(() => {
        bump(channel2, 'Server 2')
        loop(channel2, 'Server 2')
    }, delayMilliseconds)
})

client.login(process.env.TOKEN)