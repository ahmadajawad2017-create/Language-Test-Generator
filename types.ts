
export enum AppState {
  INPUT = 'input',
  EDITING = 'editing',
}

export enum InputMethod {
  TEXT = 'text',
  TTS = 'tts',
  AUDIO_FILE = 'audio_file',
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum TestType {
  LISTENING = 'Listening',
  READING = 'Reading',
}

export enum TTSVoiceName {
  KORE = 'Kore', // Female
  PUCK = 'Puck', // Male
  CHARON = 'Charon', // Female
  FENRIR = 'Fenrir', // Male
  ZEPHYR = 'Zephyr', // Female
}

export const VoiceFriendlyNames: Record<TTSVoiceName, string> = {
    [TTSVoiceName.KORE]: 'Female Voice 1',
    [TTSVoiceName.CHARON]: 'Female Voice 2',
    [TTSVoiceName.ZEPHYR]: 'Female Voice 3',
    [TTSVoiceName.PUCK]: 'Male Voice 1',
    [TTSVoiceName.FENRIR]: 'Male Voice 2',
};

export interface SingleSpeakerConfig {
  mode: 'single';
  voice: TTSVoiceName;
}

export interface MultiSpeakerConfig {
  mode: 'multi';
  speaker1: { name: string; voice: TTSVoiceName };
  speaker2: { name: string; voice: TTSVoiceName };
}

export type TTSConfig = SingleSpeakerConfig | MultiSpeakerConfig;

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  author: string;
  questions: Question[];
  testType: TestType;
  passage?: string; // Content for Reading tests
}
