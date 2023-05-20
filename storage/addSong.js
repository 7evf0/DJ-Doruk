const { SlashCommandBuilder , CommandInteraction , EmbedBuilder, Collection} = require('discord.js');
const {Player} = require("discord-music-player");


module.exports = {
    name: "Add Song",
    command: new SlashCommandBuilder()
        .setName('add_song')
        .setDescription('Add song to the queue.')
        .addStringOption(option =>
            option
                .setName("song_link")
                .setDescription("You can add Youtube or Spotify link, depending on your choice")
                .setRequired(true)
        ),

    /**
     * 
     * @param {Player} player
     * @param {CommandInteraction} interaction 
     */
    async add(player, interaction){

        await interaction.deferReply({});

        const songLink = interaction.options.get("song_link").value;
        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){

            const embedMessage = await interaction.channel.send({content: "Pending... DJ Doruk is preparin' himself!"});
            guildQueue = player.createQueue(interaction.guild.id, {
                data: {
                    channel: interaction.channel,
                    embedMsg: embedMessage,
                    repeat: false
                }
            });
        }
        
        if(!interaction.member.voice.channel){
            interaction.channel.send({content: "You should be on a voice channel to add songs!"});
            return;
        }

        try {
            await guildQueue.join(interaction.member.voice.channel);
        } catch (error) {
            interaction.channel.send({content: "Error occured while adding song! Try again later."});
            console.log(error);
            return;
        }

        let song = await guildQueue.play(songLink).catch(err => {
            if(!guildQueue){
                guildQueue.stop();
            }
            interaction.channel.send({content: "Error occured while adding song! Try again later."});
            console.log(err);
            return;
        });

        song.setData({
            request: (interaction.member.nickname ? interaction.member.nickname : interaction.user.username)
        })

        await interaction.editReply({
            content: `${interaction.member.nickname ? interaction.member.nickname : interaction.user.username} has succesfully added ${song.name} to the queue!!`
        });
    }
}