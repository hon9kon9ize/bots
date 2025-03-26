import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import DiscordCommand from '../interfaces/discord-command';
import { getTaskResult, tts } from '../tts';
import { voices } from '../config';

const pollTaskResult = async (
  taskId: string,
  interaction: CommandInteraction,
  attempts = 0
) => {
  const taskResult = await getTaskResult(taskId);

  if (taskResult.status === 'PENDING') {
    if (attempts >= 20) {
      interaction.editReply({
        content:
          '❌ The task is taking too long to complete. Please try again later.'
      });
      return;
    }

    return new Promise((resolve) =>
      setTimeout(
        () => resolve(pollTaskResult(taskId, interaction, attempts + 1)),
        1000
      )
    );
  }

  if (taskResult.status === 'FAILED') {
    throw new Error(taskResult.message);
  }

  if (!taskResult.audio_url) {
    interaction.editReply({
      content: '❌ Failed to retrieve the audio file. Please try again later.'
    });
    return;
  }

  // convert base64 to buffer
  const audioBuffer = Buffer.from(taskResult.audio_url.split(',')[1], 'base64');

  await interaction.editReply({
    files: [{ attachment: audioBuffer, name: 'response.wav' }]
  });
};

export default {
  data: new SlashCommandBuilder()
    .setName('my-tts')
    .setDescription('This command will convert text to speech.')
    .addStringOption((option) =>
      option
        .setName('input_text')
        .setDescription('The text to convert')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('voice')
        .setDescription('The voice to use')
        .setRequired(true)
        .addChoices({
          name: '👧 凱婷',
          value: 'mk_girl'
        })
    )
    .addStringOption((option) =>
      option
        .setName('voice')
        .setDescription('The voice to use')
        .setRequired(true)
        .addChoices({
          name: '🥸 全叔',
          value: 'doraemon'
        })
    )
    .addStringOption((option) =>
      option
        .setName('voice')
        .setDescription('The voice to use')
        .setRequired(true)
        .addChoices({
          name: '⭐ 星仔',
          value: 'sing'
        })
    ),
  async execute(interaction) {
    const ephemeral = false; // <-- always send "PUBLIC" to the channel
    const inputText = interaction.options.get('input_text')?.value?.toString();
    const voiceName = interaction.options.get('voice')?.value?.toString();

    if (!inputText) {
      return interaction.reply({
        content: '❌ Please provide a valid text to convert.',
        ephemeral
      });
    }

    if (!voiceName || voiceName in voices === false) {
      return interaction.reply({
        content: '❌ Please provide a valid voice.',
        ephemeral
      });
    }

    const response = await interaction.reply({
      content: `🗣️ __TTS:__\n> *${inputText}*\n- Voice: ${voiceName}\n⏳ Please wait...`,
      ephemeral
    });

    const voice = voices[voiceName];

    try {
      const taskId = await tts(inputText, voice);

      // poll the task result
      await pollTaskResult(taskId, interaction);
    } catch (error: any) {
      console.error(error);

      if (error.response?.data?.message) {
        console.error(
          'error.response.data.message',
          error.response.data.message
        );
      }
      await interaction.editReply({
        content: `❌ Something went wrong.... please try again later.`
      });
    }

    return response;
  }
} satisfies DiscordCommand;
