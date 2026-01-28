require('dotenv').config()
const { Client } = require('discord.js-selfbot-v13')
const client = new Client()

let isStarted = false;

client.on('raw', async (packet) => {
    // MESSAGE_CREATE packet
    if (packet.t === 'MESSAGE_CREATE') {
        const data = packet.d;
        // Check if message is from Disboard (ID: 302050872383242240)
        if (data.author?.id === '302050872383242240') {
            const embed = data.embeds?.[0];
            const content = embed?.description || embed?.title || data.content || "";
            const isEphemeral = (data.flags & 64) === 64;
            
            // This will log the response to your console
            console.log(`[DISBOARD RAW] ${isEphemeral ? '(Ephemeral) ' : ''}Response: "${content.replace(/\n/g, ' ')}"`);
        }
    }
});

client.on('ready', async () => {
    if (isStarted) return;
    isStarted = true;

    console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Logged in as ${client.user.tag}!`)

    const channelConfigs = [
        { id: process.env.BUMP_CHANNEL_1, name: 'Vibe 1' },
        { id: process.env.BUMP_CHANNEL_2, name: 'Vibe 2' }
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
            if (config.name === 'Vibe 1') {
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
        console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Sending /bump to ${serverName}...`);
        await channel.sendSlash('302050872383242240', 'bump');
    } catch (error) {
        console.error(`[ERROR] Failed to send bump for ${serverName}:`, error.message);
    }
}

function loop(channel, serverName) {
    // send bump message every 2 to 2.5 hours (7200000ms to 9000000ms)
    const min = 7200000;
    const max = 9000000;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const nextBumpDate = new Date(Date.now() + randomNum);
    console.log(`[WAIT] ${serverName} next bump at ${nextBumpDate.toLocaleTimeString()} (${(randomNum / 1000 / 60).toFixed(2)} min wait)`);
    
    setTimeout(async () => {
        await bump(channel, serverName);
        loop(channel, serverName);
    }, randomNum);
}

client.login(process.env.TOKEN)