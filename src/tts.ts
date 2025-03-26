import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import FormData from 'form-data';

const TTS_CLIENT_ID = process.env.TTS_CLIENT_ID;
const TTS_CLIENT_SECRET = process.env.TTS_CLIENT_SECRET;
const TTS_API_URL = process.env.TTS_API_URL;

if (!TTS_CLIENT_ID || !TTS_CLIENT_SECRET || !TTS_API_URL) {
  throw new Error('Missing environment variables');
}

interface TaskResult {
  task_id: string;
  message: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  audio_url: string; // base64 encoded wav audio
}

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

export const tts = async (inputText: string, voice: Voice): Promise<string> => {
  const form = new FormData();
  form.append('input_text', inputText);
  form.append('prompt_text', voice.promptText);
  form.append('audio', fs.createReadStream(voice.promptAudio), {
    filename: 'prompt.wav'
  });
  form.append('speed', '1.0');

  const response = await axios.post(`${TTS_API_URL}/api/tts`, form, {
    headers: {
      'CF-Access-Client-Id': TTS_CLIENT_ID,
      'CF-Access-Client-Secret': TTS_CLIENT_SECRET,
      'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
    }
  });

  return response.data.task_id as string;
};

export const getTaskResult = async (taskId: string) => {
  const response = await axios.get<TaskResult>(
    `${TTS_API_URL}/api/tts/${taskId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'CF-Access-Client-Id': TTS_CLIENT_ID,
        'CF-Access-Client-Secret': TTS_CLIENT_SECRET
      }
    }
  );

  return response.data;
};
