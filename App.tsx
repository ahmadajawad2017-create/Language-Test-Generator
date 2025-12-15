
import React, { useState, useCallback } from 'react';
import { AppState, Quiz, InputMethod, Difficulty, TTSConfig, TestType } from './types';
import { generateQuiz, generateSpeech } from './services/geminiService';
import { pcmToWavDataUrl } from './utils/audioHelper';
import InputStage from './components/InputStage';
import EditingStage from './components/EditingStage';
import Loader from './components/Loader';
import { BrainCircuitIcon, HelpIcon } from './components/Icons';
import UserManual from './components/UserManual';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState<boolean>(false);

  const handleGenerateQuiz = useCallback(async (
    title: string,
    author: string,
    inputMethod: InputMethod,
    content: { script?: string; audioFile?: File },
    numQuestions: number,
    difficulty: Difficulty,
    ttsConfig: TTSConfig,
    testType: TestType
  ) => {
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setAudioDataUrl(null);

    try {
      let scriptToUse = content.script || '';
      let audioBase64ForGemini: string | undefined = undefined;
      let audioMimeType: string | undefined = undefined;

      // Only process audio for Listening tests
      if (testType === TestType.LISTENING) {
          if (inputMethod === InputMethod.TTS && content.script) {
            setLoadingMessage('Generating audio from script...');
            const pcm_base64 = await generateSpeech(content.script, ttsConfig);
            setLoadingMessage('Converting audio to WAV format...');
            const generatedAudioDataUrl = pcmToWavDataUrl(pcm_base64);
            setAudioDataUrl(generatedAudioDataUrl);
          } else if (inputMethod === InputMethod.AUDIO_FILE && content.audioFile) {
            setLoadingMessage('Processing uploaded audio...');
            // Convert File to Base64 for Gemini
            const arrayBuffer = await content.audioFile.arrayBuffer();
            const base64String = btoa(
                new Uint8Array(arrayBuffer)
                  .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            audioBase64ForGemini = base64String;
            audioMimeType = content.audioFile.type || 'audio/mp3'; 
            
            const objectUrl = URL.createObjectURL(content.audioFile);
            setAudioDataUrl(objectUrl);
          }
      }

      setLoadingMessage('Generating quiz questions...');
      const generatedQuiz = await generateQuiz(
        { script: scriptToUse, audioBase64: audioBase64ForGemini, mimeType: audioMimeType },
        numQuestions,
        difficulty,
        title,
        author,
        testType
      );
      
      setQuiz(generatedQuiz);
      setAppState(AppState.EDITING);
    } catch (err) {
      console.error("Quiz Generation Error:", err);
      let errorMessage = 'An unexpected error occurred. This could be a network issue or an API key problem.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
          const errorObj = err as { message?: string, error?: { message?: string } };
          if (errorObj.error?.message) {
              errorMessage = errorObj.error.message;
          } else if (errorObj.message) {
              errorMessage = errorObj.message;
          }
      }
      
      setError(`Failed to generate quiz: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleStartOver = () => {
    setAppState(AppState.INPUT);
    setQuiz(null);
    setAudioDataUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {isLoading && <Loader message={loadingMessage} />}
      <header className="bg-white/80 backdrop-blur-sm shadow-md w-full p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3">
          <BrainCircuitIcon className="h-10 w-10 text-indigo-600" />
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-3 flex-grow">
            <h1 className="text-3xl font-bold text-indigo-900">Language Test Generator</h1>
            <span className="text-sm font-medium text-slate-500">Dr. Ahmed Shaaban Abdeljawad</span>
          </div>
          <button 
            onClick={() => setShowManual(true)}
            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
            title="User Manual & Guide"
          >
            <HelpIcon className="h-7 w-7" />
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 w-full">
        {error && (
          <div className="bg-red-200 border-l-4 border-red-600 text-red-900 px-4 py-3 rounded-lg relative mb-6 shadow-md" role="alert">
            <strong className="font-bold text-lg">Error: </strong>
            <span className="block sm:inline text-base">{error}</span>
          </div>
        )}
        {appState === AppState.INPUT && <InputStage onGenerate={handleGenerateQuiz} />}
        {appState === AppState.EDITING && quiz && (
          <EditingStage
            initialQuiz={quiz}
            audioDataUrl={audioDataUrl}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      <footer className="text-center p-4 text-slate-500 text-sm">
        Powered by Google Gemini AI
      </footer>

      {showManual && <UserManual onClose={() => setShowManual(false)} />}
    </div>
  );
};

export default App;
