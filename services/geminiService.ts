
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Quiz, Difficulty, TTSConfig, TestType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to shuffle questions' options
const shuffleOptions = (questions: any[]) => {
    return questions.map(q => {
        const optionsWithStatus = q.options.map((opt: string, i: number) => ({
            text: opt,
            isCorrect: i === q.correctAnswerIndex
        }));
        
        // Fisher-Yates shuffle
        for (let i = optionsWithStatus.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsWithStatus[i], optionsWithStatus[j]] = [optionsWithStatus[j], optionsWithStatus[i]];
        }
        
        return {
            ...q,
            options: optionsWithStatus.map((o: any) => o.text),
            correctAnswerIndex: optionsWithStatus.findIndex((o: any) => o.isCorrect)
        };
    });
};

export const generateQuiz = async (
  content: { script?: string; audioBase64?: string; mimeType?: string },
  numQuestions: number,
  difficulty: Difficulty,
  title: string,
  author: string,
  testType: TestType
): Promise<Quiz> => {

  const hasAudio = !!content.audioBase64;
  const isReading = testType === TestType.READING;

  const fullPrompt = `
    You are an expert language educator creating a ${isReading ? 'Reading' : 'Listening'} comprehension quiz.
    Your task is to generate a quiz based on the provided ${hasAudio ? 'audio file' : (isReading ? 'reading passage' : 'script')}.
    
    Quiz requirements:
    - Title: "${title}"
    - Author: "${author}"
    - Difficulty Level: ${difficulty}
    - Number of questions: ${numQuestions}

    For each question:
    - It must be a multiple-choice question with exactly 4 options.
    - One option must be the correct answer.
    - The other three options must be plausible but incorrect distractors.
    - Provide a brief explanation for the correct answer, intended for the teacher's reference.
    - The question, options, and explanation must be based directly on the provided content.
    ${isReading ? '- Since this is a reading test, focus on reading skills like inference, vocabulary in context, and main idea identification.' : ''}
  
    ${!hasAudio ? `
    Here is the ${isReading ? 'reading passage' : 'script'} to use:
    --- CONTENT START ---
    ${content.script}
    --- CONTENT END ---
    ` : 'The audio content is attached to this request.'}
  `;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      author: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ['questionText', 'options', 'correctAnswerIndex', 'explanation'],
        },
      },
    },
    required: ['title', 'author', 'questions'],
  };

  const requestParts: any[] = [{ text: fullPrompt }];

  if (hasAudio && content.audioBase64 && content.mimeType) {
    requestParts.push({
        inlineData: {
            mimeType: content.mimeType,
            data: content.audioBase64
        }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: requestParts }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    }
  });

  const quizData = JSON.parse(response.text);

  // Shuffle options for each question to avoid patterns
  quizData.questions = shuffleOptions(quizData.questions);

  // Add unique IDs to each question
  quizData.questions = quizData.questions.map((q: any) => ({
    ...q,
    id: crypto.randomUUID(),
  }));
  
  quizData.testType = testType;
  // If it's a reading test, include the passage in the quiz object so it can be exported
  if (isReading && content.script) {
    quizData.passage = content.script;
  }

  return quizData as Quiz;
};


export const generateSpeech = async (script: string, config: TTSConfig): Promise<string> => {
    let speechConfig: any;

    if (config.mode === 'single') {
        speechConfig = {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: config.voice },
            },
        };
    } else {
        speechConfig = {
            multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                    {
                        speaker: config.speaker1.name,
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: config.speaker1.voice } },
                    },
                    {
                        speaker: config.speaker2.name,
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: config.speaker2.voice } },
                    },
                ],
            },
        };
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: script }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig,
        },
    });
    
    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    if (audioPart && audioPart.inlineData) {
        return audioPart.inlineData.data;
    }

    throw new Error('Failed to generate audio. No audio data received from API.');
};

export const getGenderForName = async (name: string): Promise<'male' | 'female' | 'unknown'> => {
  const prompt = `Is the name "${name}" typically male or female? Respond with only one word: "male", "female", or "unknown".`;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
    });
    const result = response.text.trim().toLowerCase();
    if (result === 'male' || result === 'female') {
        return result;
    }
    return 'unknown';
  } catch (error) {
    console.error(`Error determining gender for name "${name}":`, error);
    return 'unknown';
  }
};
