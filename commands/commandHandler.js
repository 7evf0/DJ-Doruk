const fs = require("fs")
const discord = require("discord.js");


const commands = [];
let commandCodes = {};


module.exports = {
    
    /**
     * 
     * @param {discord.Client} client
     */

    async handler(client){
        const allEvents = fs.readdirSync("./commands/").filter(file => file.endsWith(".js") && !file.startsWith("commandHandler.js"));

        allEvents.forEach((e) => {
            const command = require(`./${e}`);
            client.commands.set(e, command.command);
        });

        client.application.commands.set(client.commands);
    },
        
}