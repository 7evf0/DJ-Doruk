const { SlashCommandBuilder , CommandInteraction , EmbedBuilder, Collection} = require('discord.js');
const {Player} = require("discord-music-player");


module.exports = {
    name: "Display Queue",
    command: new SlashCommandBuilder()
        .setName('display_queue')
        .setDescription('Display all the songs in the queue at the moment.'),

    /**
     * 
     * @param {Player} player
     * @param {CommandInteraction} interaction 
     */
    async display(player, interaction){

        await interaction.deferReply({});

        let guildQueue = player.getQueue(interaction.guild.id);
        if(!guildQueue){
            interaction.editReply({content: "There are no songs available on the queue at the moment!"});
            return;
        }

        const songs = guildQueue.songs;

        const embed = new EmbedBuilder()
            .setTitle("Songs on The Playlist")
            .setAuthor({name: "DJ Doruk"})
            .setDescription(`There are ${songs.length} songs available on the playlist:`)
            .addFields({
                name: "Playlist",
                value: songs.join("\n")
            });

        await interaction.editReply({
            embeds: [embed]
        });
    }
}