const discord = require("discord.js");
const dotenv = require("dotenv");
const {Client , IntentsBitField ,Collection} = discord;
const {Player, RepeatMode} = require("discord-music-player");
const {handler} = require("./commands/commandHandler.js");
const embedFunc = require("./embedPlay.js");
const embedMsg = require("./embedPlay.js");

module.exports = {
    
    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
    async pause(player, msg){
        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){
            msg.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.setPaused(true);
        } catch (error) {
            msg.channel.send({content: "Error occured while pausing the song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
    async commands(player, msg){
        const embed = new discord.EmbedBuilder()
            .setTitle("Command List")
            .setAuthor({name: "DJ Doruk"})
            .setColor("Blurple")
            .addFields({
                name: "!play X",
                value: "Adds the given song on the playlist. This song may be a Youtube link, Spotify link, or just a name of a song. It's up to you!"
            })
            .addFields({
                name: "!playlist X",
                value: "Adds the given playlist on the queue. This playlist may be ONLY a Youtube playlist!"
            })
            .addFields({
                name: "!play next X",
                value: "Plays the given song after the currently playing song."
            })
            .addFields({
                name: "!stop",
                value: "Clears and stops the playlist."
            })
            .addFields({
                name: "!leave",
                value: "Lets DJ Doruk to leave the voice channel, after the playlist is ended."
            })
            .addFields({
                name: "!skip",
                value: "Skips the currently playing song and plays the next song on the playlist."
            })
            .addFields({
                name: "!queue",
                value: "Shows the current playlist."
            })
            .addFields({
                name: "!repeat",
                value: "Repeats the currently playing song, until said otherwise."
            })
            .addFields({
                name: "!repeatstop",
                value: "Stops the repeat of the currently playing song."
            })
            .addFields({
                name: "!pause",
                value: "Pauses the song."
            })
            .addFields({
                name: "!resume",
                value: "Resumes the paused song."
            });

        
        msg.channel.send({
            embeds: [embed]
        }).catch(err => {
            console.log(err);
        });
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
    async playNext(player, msg){
        if(!msg.member.voice.channel){
            msg.channel.send({content: "You should be on a voice channel to add songs!"});
            return;
        }

        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){

            const embedMessage = await msg.channel.send({content: "Pending... DJ Doruk is preparin' himself!"});
            guildQueue = player.createQueue(msg.guild.id, {
                data: {
                    channel: msg.channel,
                    embedMsg: embedMessage,
                    repeat: false,
                    leave: false
                }
            });
        }

        const songLink = msg.content.split(" ").slice(2).join(" ");

        try {
            await guildQueue.join(msg.member.voice.channel);
            let song = await guildQueue.play(songLink, {
                index: 0
            }).catch(err => {
                if(!guildQueue){
                    guildQueue.stop();
                }
                console.log(err);
                return;
            });
    
            song.setData({
                request: (msg.member.nickname ? msg.member.nickname : msg.author.username)
            });
    
            await msg.channel.send({
                content: `\`${msg.member ? msg.member.nickname : msg.user.username}\` has succesfully added ${song.name} to the queue!! That song will play after the currently playing song!`
            });
        } catch (error) {
            msg.channel.send({content: "Error occured while adding song! Try again later."});
            console.log(error);
            return;
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
    async play(player, msg){
        if(!msg.member.voice.channel){
            msg.channel.send({content: "You should be on a voice channel to add songs!"});
            return;
        }

        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){

            const embedMessage = await msg.channel.send({content: "Pending... DJ Doruk is preparin' himself!"});
            guildQueue = player.createQueue(msg.guild.id, {
                data: {
                    channel: msg.channel,
                    embedMsg: embedMessage,
                    repeat: false,
                    leave: false
                }
            });
        }

        const songLink = msg.content.split(" ").slice(1).join(" ");

        try {
            await guildQueue.join(msg.member.voice.channel);
            let song = await guildQueue.play(songLink).catch(err => {
                if(!guildQueue){
                    guildQueue.stop();
                }
                console.log(err);
                return;
            });
    
            song.setData({
                request: (msg.member.nickname ? msg.member.nickname : msg.author.username)
            });
    
            await msg.channel.send({
                content: `\`${msg.member ? msg.member.nickname : msg.user.username}\` has succesfully added ${song.name} to the queue!!`
            });
        } catch (error) {
            msg.channel.send({content: "Error occured while adding song! Try again later."});
            console.log(error);
            return;
        } 
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
    async playlist(player, msg){
        
        if(!msg.member.voice.channel){
            msg.channel.send({content: "You should be on a voice channel to add songs!"});
            return;
        }

        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){

            const embedMessage = await msg.channel.send({content: "Pending... DJ Doruk is preparin' himself!"});
            guildQueue = player.createQueue(msg.guild.id, {
                data: {
                    channel: msg.channel,
                    embedMsg: embedMessage,
                    repeat: false,
                    leave: false
                }
            });
        }

        const playlistLink = msg.content.split(" ").slice(1).join(" ");

        try {
            await guildQueue.join(msg.member.voice.channel);
            let playlist = await guildQueue.playlist(playlistLink);
    
            playlist.songs.forEach(song => {
                song.setData({
                    request: (msg.member.nickname ? msg.member.nickname : msg.author.username)
                });
            });
    
            await msg.channel.send({
                content: `\`${msg.member ? msg.member.nickname : msg.user.username}\` has succesfully added the playlist to the queue!!`
            });

        } catch (error) {
            msg.channel.send({content: "Error occured while adding the playlist! Try again later."});
            console.log(error);
            return;
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
     async resume(player, msg){
        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){
            msg.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.setPaused(false);
        } catch (error) {
            msg.channel.send({content: "Error occured while trying to resume the song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
    async skip(player, msg){
        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){
            msg.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.skip(0);
        } catch (error) {
            msg.channel.send({content: "Error occured while skipping song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.Message} msg 
     */
    async stop(player, msg){
        let guildQueue = player.getQueue(msg.guild.id);
        if(!guildQueue){
            msg.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.stop();
        } catch (error) {
            msg.channel.send({content: "Error occured while stopping the playlist! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player
     * @param {discord.Message} msg 
     */
     async displayMsg(player, msg){

        try {
                //  check if there are songs available at the moment
            let guildQueue = player.getQueue(msg.guild.id);
            if(!guildQueue || guildQueue.songs.length == 0){
                msg.channel.send({content: "There are no songs available on the queue at the moment!"});
                return;
            }

            const songs = guildQueue.songs;
            const ProgressBar = guildQueue.createProgressBar();
            const currTimePassedStr = ProgressBar.times.split('/')[0];

            const arrTime = currTimePassedStr.split(':').reverse();

            let currTimePassed = 0;
            for (let index = 0; index < arrTime.length; index++) {
                currTimePassed += parseInt(arrTime[index]) * Math.pow(60, index);
            }

            let songList = "", remainingTimeStr = "";
            let count = 1;
            let remainingTime = 0;

            songs.forEach(element => {
                let currLine = count + "- " + element.name + "\n";
                if(songList.length + currLine.length < 1024){
                    songList += count + "- " + element.name + "\n"; 
                }

                remainingTime += element.milliseconds / 1000;
                count++;
            });

            remainingTime -= currTimePassed;
            
            let arrRemainingTime = [];
            while(remainingTime > 0){
                arrRemainingTime.push((remainingTime % 60).toString());
                remainingTime = Math.floor(remainingTime / 60);
            }
            arrRemainingTime = arrRemainingTime.reverse();

            const embed = new discord.EmbedBuilder()
                .setTitle("Songs on The Playlist")
                .setAuthor({name: "DJ Doruk"})
                .setDescription(`There are ${songs.length} songs available on the playlist:`)
                .addFields({
                    name: "Playlist",
                    value: songList
                })
                .addFields({
                    name: "Total Time Remaining",
                    value: `\`${arrRemainingTime.join(":")}\``
                });

            await msg.channel.send({
                embeds: [embed]
            });
        } catch (error) {
            await msg.channel.send({
                content: "Error occured while displaying the queue. Please try again later!"
            });
            console.log(error);
        }
    },

    //  BUTTON INTERACTION

    /**
     * 
     * @param {Player} player 
     * @param {discord.ButtonInteraction} interaction 
     */
    async resume(player, interaction){
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.setPaused(false);
        } catch (error) {
            interaction.channel.send({content: "Error occured while trying to resume the song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.ButtonInteraction} interaction 
     */
    async startOver(player, interaction){
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.seek(0);
        } catch (error) {
            interaction.channel.send({content: "Error occured while trying to start over the song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.ButtonInteraction} interaction 
     */
    async pause(player, interaction){
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.setPaused(true);
        } catch (error) {
            interaction.channel.send({content: "Error occured while pausing the song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.ButtonInteraction} interaction 
     */
    async skip(player, interaction){
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            guildQueue.skip(0);
        } catch (error) {
            interaction.channel.send({content: "Error occured while skipping song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.ButtonInteraction} interaction 
     */
     async rollBack(player, interaction){
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            
            guildQueue.seek(guildQueue.nowPlaying.seekTime - 10 * 1000);
        } catch (error) {
            interaction.channel.send({content: "Error occured while rolling back the song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.ButtonInteraction} interaction 
     */
     async rollForward(player, interaction){
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            
            guildQueue.seek(guildQueue.nowPlaying.seekTime + 10 * 1000);
        } catch (error) {
            interaction.channel.send({content: "Error occured while rolling forward the song! Try again later!"});
            console.log(error);
        }
    },

    /**
     * 
     * @param {Player} player 
     * @param {discord.ButtonInteraction} interaction 
     */
     async repeat(player, interaction){
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.channel.send({content: "There is no active song playing!"});
            return;
        }
        try {
            if(guildQueue.data.repeat){
                guildQueue.setRepeatMode(RepeatMode.DISABLED);
                guildQueue.data.repeat = false;
            }
            else{
                guildQueue.setRepeatMode(RepeatMode.SONG);
                guildQueue.data.repeat = true;
            }
            const object = await embedFunc(guildQueue, guildQueue.nowPlaying);
            const currEmbed = guildQueue.data.embedMsg;
            await currEmbed.edit({
                embeds: object.emb,
                components: object.actionRow
            });
        } catch (error) {
            interaction.channel.send({content: "Error occured while rolling forward the song! Try again later!"});
            console.log(error);
        }
    },

}