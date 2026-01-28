require('dotenv').config()
const { Client } = require('discord.js-selfbot-v13')
const client = new Client()

let isStarted = false;

client.on('ready', async () => {
    if (isStarted) return;
    isStarted = true;

    console.log(`[${new Date().toLocaleString()}] Logged in as ${client.user.tag}!`)

    const channelConfigs = [
        { id: process.env.BUMP_CHANNEL_1, name: 'Server 1' },
        { id: process.env.BUMP_CHANNEL_2, name: 'Server 2' }
    ];

    for (const config of channelConfigs) {
        if (!config.id) {
            console.error(`[ERROR] Channel ID for ${config.name} is missing in .env!`);
            continue;
        }

        try {
            const channel = await client.channels.fetch(config.id);
            if (!channel) {
                console.error(`[ERROR] Could not find channel for ${config.name} (${config.id})`);
                continue;
            }

            console.log(`[INIT] Starting bump loop for ${config.name}`);
            
            // Initial bump
            if (config.name === 'Server 1') {
                await startBumping(channel, config.name);
            } else {
                // Add a random delay for the second server to avoid simultaneous spikes
                const delayMinutes = Math.floor(Math.random() * 5) + 1;
                console.log(`[DELAY] ${config.name} first bump will start in ${delayMinutes} minutes`);
                setTimeout(() => startBumping(channel, config.name), delayMinutes * 60 * 1000);
            }

        } catch (err) {
            console.error(`[ERROR] Failed to initialize ${config.name}:`, err.message);
        }
    }
})

async function startBumping(channel, serverName) {
    await bump(channel, serverName);
    loop(channel, serverName);
}

async function bump(channel, serverName) {
    try {
        console.log(`[${new Date().toLocaleString()}] Attempting to bump ${serverName}...`);
        await channel.sendSlash('302050872383242240', 'bump');
        console.log(`[SUCCESS] Bumped ${serverName}!`);
    } catch (error) {
        console.error(`[ERROR] Failed to bump ${serverName}:`, error.message);
        // If it failed, we still want to continue the loop for next time
    }
}

function loop(channel, serverName) {
    // send bump message every 2 to 2.5 hours (7200000ms to 9000000ms)
    const min = 7200000;
    const max = 9000000;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    
    console.log(`[NEXT] Next bump for ${serverName} in ${(randomNum / 1000 / 60).toFixed(2)} minutes`);
    
    setTimeout(async () => {
        await bump(channel, serverName);
        loop(channel, serverName);
    }, randomNum);
}

client.login(process.env.TOKEN)