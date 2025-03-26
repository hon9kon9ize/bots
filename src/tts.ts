import axios from 'axios';
import fs from 'node:fs';
import FormData from 'form-data';
import { Voice } from './config';

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
