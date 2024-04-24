import { Client } from 'discord.js';
import { config } from './config';
import { commands, stringSelectMenuResponses } from './commands';
import { deployCommands } from './deploy-commands';

const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'DirectMessages']
});

client.once('ready', () => {
  console.log('Discord bot is ready! 🤖');
});

client.on('guildCreate', async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  } else if (interaction.isStringSelectMenu()) {
    const commandName = interaction.message.interaction?.commandName;

    if (!commandName) {
      return;
    }

    if (commandName in stringSelectMenuResponses) {
      stringSelectMenuResponses[
        commandName as keyof typeof stringSelectMenuResponses
      ].stingSelectMenuResponse(interaction);
    }

    // const answer = values[0];
    // const correct = answer === 'A'; // Assume A is the correct answer

    // await interaction.update({
    //   content: correct ? 'Correct! 🎉' : 'Incorrect! 😢',
    //   components: []
    // });
  }
});

client.login(config.DISCORD_TOKEN);
