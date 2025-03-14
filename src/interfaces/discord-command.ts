import {
  ChatInputCommandInteraction,
  CommandInteraction,
  InteractionResponse,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from 'discord.js';

export default interface DiscordCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction | CommandInteraction
  ) => Promise<InteractionResponse<boolean>>;
}
