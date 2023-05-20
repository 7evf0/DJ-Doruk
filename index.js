const discord = require("discord.js");
const dotenv = require("dotenv");
const {Client , IntentsBitField ,Collection} = discord;
const {Player, RepeatMode} = require("discord-music-player");
const {handler} = require("./commands/commandHandler.js");
const {add} = require("./storage/addSong.js");
const {display} = require("./storage/displayQueue.js");
const embedFunc = require("./embedPlay.js");
const {pause, resume, skip, displayMsg, repeat, stop, commands, playNext, playlist, play, startOver} = require("./playerMethods.js");
const { ActivityType } = require("discord.js");

dotenv.config();

//  Client Settings
const client = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.MessageContent
    ]
});

client.commands = new Collection();
//  Player Settings

const player = new Player(client, {
    leaveOnEnd: false,
    leaveOnStop: false
});

//  time interval view
setInterval(async () => {
    let list = client.guilds.cache.forEach(async guild => {
        let guildQueue = player.getQueue(guild.id);
        if(!guildQueue || guildQueue.songs.length == 0){}
        else{
            if(guildQueue.data.embedMsg && guildQueue.isPlaying){
                const object = await embedFunc(guildQueue, guildQueue.nowPlaying);
                guildQueue.data.embedMsg.edit({
                    embeds: object.emb,
                    components: object.actionRow
                });
            }
        }
    });
}, 1000);


/*
*
*   CLIENT EVENTS
*
*/
client.on("ready",async () => {
    if(client.isReady()){
        console.log("Turned on " + client.user.username);
        client.user.setActivity("Genel Müzik Külliyatı", {type: ActivityType.Listening});

        //await handler(client);
    }
});


let leaveChannel = false;
client.on("interactionCreate", async (interaction) => {

    if(!interaction.member.roles.cache.some(role => role.name === "MusicAdmin")){
        return;
    }

    if(interaction.isCommand()){
        if(interaction.command.name === "add_song"){
            await add(player ,interaction);
        }

        if(interaction.command.name === "display_queue"){
            await display(player, interaction);
        }
    }

    if(interaction.isButton()){
        //  PAUSE / RESUME
        if(interaction.customId === "pause_resume"){
            let guildQueue = await player.getQueue(interaction.guild.id);
            if(!guildQueue){
                interaction.channel.send({content: "There is no active song playing!"});
                return;
            }
            if(!guildQueue.paused){
                await pause(player, interaction);
            }
            else{
                await resume(player, interaction);
            }
            interaction.deferUpdate();
        }

        //SKIP
        if(interaction.customId === "skip"){
            await skip(player, interaction);
            interaction.deferUpdate();
        }

        //REPEAT
        if(interaction.customId === "repeat"){
            await repeat(player, interaction);
            interaction.deferUpdate();
        }

        //START OVER
        if(interaction.customId == "start_over"){
            await startOver(player, interaction);
            interaction.deferUpdate();
        }
    }
});

client.on("messageCreate", async (msg) => {

    if(!msg.member.roles.cache.some(role => role.name === "MusicAdmin")){
        return;
    }

    if(msg.content.startsWith("!play next")){
        await playNext(player, msg);
    }

    else if(msg.content.startsWith("!playlist")){
        await playlist(player, msg);
    }

    else if(msg.content.startsWith("!play")){
        await play(player, msg);
    }

    if(msg.content.startsWith("!skip")){
        await skip(player, msg);
    }

    if(msg.content.startsWith("!queue")){
        await displayMsg(player, msg);
    }

    if(msg.content.startsWith("!repeat")){
        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){
            msg.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.setRepeatMode(RepeatMode.SONG);
            guildQueue.data.repeat = true;
            const object = await embedFunc(guildQueue, guildQueue.nowPlaying);
            const currEmbed = guildQueue.data.embedMsg;
            await currEmbed.edit({
                embeds: object.emb,
                components: object.actionRow
            });
        } catch (error) {
            msg.channel.send({content: "Error occured while repeating song! Try again later!"});
            console.log(error);
        }
    }

    if(msg.content.startsWith("!repeatstop")){
        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){
            msg.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.setRepeatMode(RepeatMode.DISABLED);
            guildQueue.data.repeat = false;
            const object = await embedFunc(guildQueue, guildQueue.nowPlaying);
            const currEmbed = guildQueue.data.embedMsg;
            await currEmbed.edit({
                embeds: object.emb,
                components: object.actionRow
            });
        } catch (error) {
            msg.channel.send({content: "Error occured while stopping to repeat song! Try again later!"});
            console.log(error);
        }
    }

    if(msg.content.startsWith("!pause")){
        await pause(player, msg);
    }

    if(msg.content.startsWith("!resume")){
        await resume(player, msg);
    }

    if(msg.content.startsWith("!leave")){
        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){
            msg.channel.send({
                content: "DJ Doruk is already inavailable. Please try again to leave later!"
            });
            return;
        }
        if(!guildQueue.nowPlaying){
            guildQueue.leave();
        }
        else{
            guildQueue.data.leave = true;
            await msg.channel.send({
                content: "DJ Doruk will leave the voice channel after the queue is finished!"
            });
        }
        
    }

    if(msg.content.startsWith("!stop")){
        await stop(player, msg);
    }

    if(msg.content.startsWith("!commands")){
        await commands(player, msg);
    }

});

player.on("songFirst", async (queue, song) => {

    const channel = queue.data.channel;
    const msg = queue.data.embedMsg;

    try {
        const object = await embedFunc(queue, song);
        const newMsg = await channel.send({
            content: "",
            embeds: object.emb,
            components: object.actionRow
        });
        queue.data.embedMsg = newMsg;
        await msg.delete();
    } catch (error) {
        console.log(error);
    }
});

player.on("songChanged", async (queue, newSong, oldSong) => {
    const channel = queue.data.channel;
    const msg = queue.data.embedMsg;

    try {
        const object = await embedFunc(queue, newSong);
        const newMsg = await channel.send({
            content: "",
            embeds: object.emb,
            components: object.actionRow
        });
        queue.data.embedMsg = newMsg;
        await msg.delete();
    } catch (error) {
        console.log(error);
    }
});

player.on("queueEnd", async (queue) => {
    const msg = queue.data.embedMsg;
    try {
        if(queue.data.leave){
            try{
                await queue.stop();
                await queue.leave();
            }catch(error){
                console.log(error);
            }
        }
        await msg.delete();
        queue.data.embedMsg = null;
    } catch (error) {
    }
});

player.on("queueDestroyed", async (queue) => {
    const msg = queue.data.embedMsg;
    try {
        if(queue.data.leave){
            try{
                await queue.stop();
                await queue.leave();
            }catch(error){
                console.log(error);
            }
        }
        await msg.delete();
        queue.data.embedMsg = null;
    } catch (error) {
    }
});

client.login(process.env.TOKEN);