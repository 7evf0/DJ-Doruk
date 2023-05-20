const { Queue, Song } = require("discord-music-player");
const { ButtonStyle } = require("discord.js");
const discord = require("discord.js");
const {EmbedBuilder} = discord;

/**
 * 
 * @param {Queue} guildQueue 
 * @param {Song} song
 */
function embedMsg(guildQueue, song){

    const embedMsg = new discord.EmbedBuilder()
            .setTitle(song.name)
            .setDescription(song.author)
            .setAuthor({name: "DJ Doruk is in process..🥷"})
            .setThumbnail(song.thumbnail)
            .setColor("Aqua")
            .addFields({
                name: "Duration",
                value: `\`${song.duration}\``,
                inline: true
            })
            .addFields({
                name: "Requested By:",
                value: `\`${song.data.request}\``,
                inline: true
            })
            .addFields({
                name: "Repeat Mode",
                value: `\`${(guildQueue.data.repeat ? "ON" : "OFF")}\``,
                inline: true
            })
            .addFields({
                name: "Progress Bar",
                value: `\`${(guildQueue.isPlaying) ? guildQueue.createProgressBar().times : "00:00"}\``
            });

    const row1 = new discord.ActionRowBuilder()
        .addComponents(
            new discord.ButtonBuilder()
                .setCustomId("pause_resume")
                .setLabel("Pause / Resume")
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new discord.ButtonBuilder()
                .setCustomId("skip")
                .setLabel("Skip")
                .setStyle(ButtonStyle.Danger)
        )
        .addComponents(
            new discord.ButtonBuilder()
                .setCustomId("repeat")
                .setLabel("Repeat")
                .setStyle(ButtonStyle.Secondary)
        );

    const row2 = new discord.ActionRowBuilder()
        .addComponents(
            new discord.ButtonBuilder()
                .setCustomId("start_over")
                .setLabel("🔙")
                .setStyle(ButtonStyle.Primary)
        );

    const obj = {
        emb: [embedMsg],
        actionRow: [row1, row2]
    };

    return obj;
};

module.exports = embedMsg;