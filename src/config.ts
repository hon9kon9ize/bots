import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error('Missing environment variables');
}

export const config = {
  DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID
};

export interface Voice {
  name: string;
  promptText: string;
  promptAudio: string;
}

export const voices: Record<string, Voice> = {
  mk_girl: {
    name: '👧 凱婷',
    promptText:
      '我決定咗啦，我要做一件到目前為止又或者永遠都唔會再見到我做嘅事。',
    promptAudio: path.join(__dirname, './voices/mk_girl.wav')
  },
  doraemon: {
    name: '🥸 全叔',
    promptText:
      '各位觀眾大家好，我叮噹呢又同你哋見面啦。好多謝咁多年嚟各位嘅捧場同支持。',
    promptAudio: path.join(__dirname, './voices/doraemon3.wav')
  },
  sing: {
    name: '⭐ 星仔',
    promptText:
      '塵世間最痛苦嘅事莫過於此，你把嘢喺我喉嚨度拖落去啊，唔需要猶豫㗎啦。',
    promptAudio: path.join(__dirname, './voices/sing.wav')
  }
} as const;
