import { Client } from 'discord.js';
import { config } from './config';
import { commands } from './commands';
import { deployCommands } from './deploy-commands';
import { Context, Markup, NarrowedContext, session, Telegraf } from 'telegraf';
import { getTaskResult, tts, Voice, voices } from './tts';
import { Message, Update } from 'telegraf/typings/core/types/typegram';

// Discord bot
const discordClient = new Client({
  intents: ['Guilds', 'GuildMessages', 'DirectMessages']
});

discordClient.once('ready', () => {
  console.log('hon9kon9ize bot is ready! 🤖');
});

discordClient.on('guildCreate', async (guild) => {
  await deployCommands({ guildId: guild.id });
});

discordClient.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  }
});

discordClient.login(config.DISCORD_BOT_TOKEN);

// Telegram bot

interface SessionData {
  voice?: Voice;
}

interface MyContext extends Context {
  session?: SessionData;
  // ... more props go here
}

const bot = new Telegraf<MyContext>(process.env.TELEGRAM_BOT_TOKEN as string);

bot.use(
  session({
    defaultSession: () => ({
      voice: voices['mk_girl']
    })
  })
);

bot.command('voice', async (ctx) => {
  return ctx.reply(
    '⛏️揀你想要把聲',
    Markup.keyboard([
      Object.keys(voices).map((key) => voices[key].name)
    ]).resize()
  );
});

bot.start((ctx) => {
  return ctx.reply('你打嘅字都會轉做聲音。你可以打 /voice 揀聲。');
});

const pollTaskResult = async (
  taskId: string,
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>,
  attempts = 0
) => {
  const taskResult = await getTaskResult(taskId);

  if (taskResult.status === 'PENDING') {
    if (attempts >= 20) {
      await ctx.reply('❌ 搞唔掂，等陣再試下。');
      return;
    }

    return new Promise((resolve) =>
      setTimeout(() => resolve(pollTaskResult(taskId, ctx, attempts + 1)), 1000)
    );
  }

  if (taskResult.status === 'FAILED') {
    await ctx.reply('❌ 搞唔掂，等陣再試下。');
    return;
  }

  if (!taskResult.audio_url) {
    await ctx.reply('❌ 搞唔掂，等陣再試下。');
    return;
  }

  const audioBuffer = Buffer.from(taskResult.audio_url.split(',')[1], 'base64');

  await ctx.replyWithAudio({
    source: audioBuffer
  });
};

bot.on('message', async (ctx) => {
  if (ctx.message && 'text' in ctx.message) {
    const text = ctx.message.text;

    if (
      Object.keys(voices).findIndex((key) => voices[key].name === text) !== -1
    ) {
      const voiceKey = Object.keys(voices).find(
        (key) => voices[key].name === text
      );
      const voice = voices[voiceKey as keyof typeof voices];

      if (ctx.session && typeof voice !== 'undefined') {
        ctx.session.voice = voice;

        await ctx.reply(`轉把聲做：${text}`);
      }
    } else if (ctx.session?.voice) {
      await ctx.reply('⚙️ 幫緊你...');

      try {
        const taskId = await tts(text, ctx.session?.voice);

        await pollTaskResult(taskId, ctx);
      } catch (error) {
        console.error(error);
        await ctx.reply('❌ 搞唔掂，等陣再試下。');
      }
    }
  }
});

bot.launch();

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  discordClient.destroy();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  discordClient.destroy();
});
