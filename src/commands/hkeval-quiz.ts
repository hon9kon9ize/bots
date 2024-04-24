import {
  ActionRowBuilder,
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import Airtable from 'airtable';

const userQuizAnswerMap = new Map<string, string>();

if (
  !process.env.AIRTABLE_TABLE_IDS ||
  !process.env.AIRTABLE_BASE_ID ||
  !process.env.AIRTABLE_API_KEY
) {
  throw new Error('Missing environment variables');
}

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });

export const data = new SlashCommandBuilder()
  .setName('hkeval-quiz')
  .setDescription(
    'This command will show you the quiz from HKEval benchmark MCQ.'
  );

const getShuffleRecord = async () => {
  const AIRTABLE_TABLE_IDS = (process.env.AIRTABLE_TABLE_IDS as string).split(
    ','
  );
  const base = Airtable.base(process.env.AIRTABLE_BASE_ID as string);
  const tables = AIRTABLE_TABLE_IDS.map((tableId) => base.table(tableId));
  const table = tables[Math.floor(Math.random() * tables.length)];

  // get fields ['Cantonese','A','B','C','D','Answer'] from table, all of them must be filled
  const records = await table
    .select({
      filterByFormula: 'AND({Cantonese}, {A}, {B}, {C}, {D}, {Answer})'
    })
    .firstPage();
  const filteredRecords = records.filter(
    (record) =>
      record.get('Cantonese') &&
      record.get('A') &&
      record.get('B') &&
      record.get('C') &&
      record.get('D') &&
      record.get('Answer')
  );

  return filteredRecords[Math.floor(Math.random() * records.length)];
};

export async function stingSelectMenuResponse(
  interaction: StringSelectMenuInteraction
) {
  const answer = userQuizAnswerMap.get(interaction.user.id);
  const userAnswer = interaction.values[0];
  await interaction.deferReply({ ephemeral: true });
  const correct = answer === userAnswer; // Assume A is the correct answer
  await interaction.editReply({
    content: correct ? 'Correct! 🎉' : 'Incorrect! 😢',
    components: []
  });
}

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const record = await getShuffleRecord();
    const question = record.get('Cantonese')?.toString();
    const answer = record.get('Answer')?.toString();
    const options = [
      new StringSelectMenuOptionBuilder()
        .setLabel(record.get('A')?.toString() as string)
        .setValue('A'),
      new StringSelectMenuOptionBuilder()
        .setLabel(record.get('B')?.toString() as string)
        .setValue('B'),
      new StringSelectMenuOptionBuilder()
        .setLabel(record.get('C')?.toString() as string)
        .setValue('C'),
      new StringSelectMenuOptionBuilder()
        .setLabel(record.get('D')?.toString() as string)
        .setValue('D')
    ];

    if (record.get('E')) {
      options.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(record.get('E')?.toString() as string)
          .setValue('E')
      );
    }

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('multiple-choice')
        .setPlaceholder('Select an option')
        .addOptions(...options)
    );

    if (!question || !answer) {
      return interaction.editReply('Failed to fetch quiz, please try again.');
    }

    userQuizAnswerMap.set(interaction.user.id, answer);

    return interaction.editReply({
      content: question,
      components: [row as any]
    });
  } catch (error) {
    console.error(error);
    return interaction.reply('Failed to fetch quiz, please try again.');
  }
}
