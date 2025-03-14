import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import DiscordCommand from '../interfaces/discord-command';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction: CommandInteraction) {
    return interaction.reply('Pong!');
  }
} satisfies DiscordCommand;
