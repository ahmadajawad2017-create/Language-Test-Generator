
import React, { useState, useMemo, useEffect } from 'react';
import { InputMethod, Difficulty, TTSConfig, TTSVoiceName, VoiceFriendlyNames, TestType } from '../types';
import { TextIcon, SpeakerIcon, GenerateIcon, UploadIcon, BookIcon } from './Icons';
import { getGenderForName } from '../services/geminiService';

interface InputStageProps {
  onGenerate: (
    title: string,
    author: string,
    inputMethod: InputMethod,
    content: { script?: string; audioFile?: File },
    numQuestions: number,
    difficulty: Difficulty,
    ttsConfig: TTSConfig,
    testType: TestType
  ) => void;
}

const femaleVoices: TTSVoiceName[] = [TTSVoiceName.KORE, TTSVoiceName.CHARON, TTSVoiceName.ZEPHYR];
const maleVoices: TTSVoiceName[] = [TTSVoiceName.PUCK, TTSVoiceName.FENRIR];

const InputStage: React.FC<InputStageProps> = ({ onGenerate }) => {
  const [testType, setTestType] = useState<TestType>(TestType.LISTENING);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [inputMethod, setInputMethod] = useState<InputMethod>(InputMethod.TEXT);
  const [script, setScript] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [ttsConfig, setTtsConfig] = useState<TTSConfig>({
    mode: 'single',
    voice: TTSVoiceName.KORE,
  });

  // Reset input method when switching test types
  useEffect(() => {
    if (testType === TestType.READING) {
      setInputMethod(InputMethod.TEXT);
    }
  }, [testType]);

  const isFormValid = useMemo(() => {
    if (!title.trim()) return false;
    if (inputMethod === InputMethod.TEXT) return script.trim().length > 0;
    if (inputMethod === InputMethod.TTS) {
        if (!script.trim()) return false;
        if(ttsConfig.mode === 'multi') {
            return ttsConfig.speaker1.name.trim().length > 0 && ttsConfig.speaker2.name.trim().length > 0;
        }
        return true;
    }
    if (inputMethod === InputMethod.AUDIO_FILE) return audioFile !== null;
    return false;
  }, [title, inputMethod, script, ttsConfig, audioFile]);

  const handleMultiSpeakerChange = (speaker: 'speaker1' | 'speaker2', key: 'name' | 'voice', value: string) => {
     if (ttsConfig.mode === 'multi') {
        setTtsConfig({
            ...ttsConfig,
            [speaker]: {
                ...ttsConfig[speaker],
                [key]: value,
            }
        });
     }
  };

  const handleSpeakerNameBlur = async (speaker: 'speaker1' | 'speaker2', name: string) => {
    if (!name.trim()) return;

    try {
        const gender = await getGenderForName(name);
        if (gender === 'unknown') return;

        setTtsConfig(prevConfig => {
            if (prevConfig.mode !== 'multi') {
                return prevConfig;
            }

            const otherSpeakerKey = speaker === 'speaker1' ? 'speaker2' : 'speaker1';
            const otherSpeakerVoice = prevConfig[otherSpeakerKey].voice;

            let voicePool: TTSVoiceName[] = [];
            if (gender === 'male') {
                voicePool = maleVoices.filter(v => v !== otherSpeakerVoice);
                if (voicePool.length === 0) voicePool = maleVoices;
            } else { 
                voicePool = femaleVoices.filter(v => v !== otherSpeakerVoice);
                if (voicePool.length === 0) voicePool = femaleVoices;
            }

            const newVoice = voicePool[Math.floor(Math.random() * voicePool.length)];

            if (newVoice) {
                return {
                    ...prevConfig,
                    [speaker]: {
                        ...prevConfig[speaker],
                        voice: newVoice,
                    },
                };
            }
            return prevConfig;
        });
    } catch (error) {
        console.error("Failed to auto-select voice:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const content = {
        script: inputMethod === InputMethod.AUDIO_FILE ? undefined : script,
        audioFile: inputMethod === InputMethod.AUDIO_FILE && audioFile ? audioFile : undefined
    };

    onGenerate(title, author, inputMethod, content, numQuestions, difficulty, ttsConfig, testType);
  };

  const tabClass = (method: InputMethod) =>
    `flex items-center gap-2 px-4 py-2 text-base font-medium rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none ${
      inputMethod === method
        ? 'border-purple-500 text-purple-600 bg-purple-50'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
    }`;

  const skillTabClass = (type: TestType) => 
    `flex-1 flex items-center justify-center gap-2 py-3 text-lg font-semibold rounded-lg transition-all ${
        testType === type 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      
      {/* Skill Selection */}
      <div className="p-1 bg-white rounded-xl shadow-sm border border-slate-200 flex gap-1">
        <button type="button" onClick={() => setTestType(TestType.LISTENING)} className={skillTabClass(TestType.LISTENING)}>
            <SpeakerIcon className="h-5 w-5" />
            Listening Skill
        </button>
        <button type="button" onClick={() => setTestType(TestType.READING)} className={skillTabClass(TestType.READING)}>
            <BookIcon className="h-5 w-5" />
            Reading Skill
        </button>
      </div>

      <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-semibold text-indigo-700 border-b-2 border-indigo-100 pb-4 mb-6">Step 1: Test Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-base font-medium text-slate-700 mb-2">Test Title <span className="text-red-500">*</span></label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full text-base px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label htmlFor="author" className="block text-base font-medium text-slate-700 mb-2">Author (Optional)</label>
            <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full text-base px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>
      </div>

      <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Step 2: Provide Content</h2>
        
        {testType === TestType.LISTENING && (
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex flex-wrap gap-2 sm:gap-0 sm:space-x-4">
                <button type="button" onClick={() => setInputMethod(InputMethod.TEXT)} className={tabClass(InputMethod.TEXT)}><TextIcon className="h-5 w-5"/> Script Text</button>
                <button type="button" onClick={() => setInputMethod(InputMethod.TTS)} className={tabClass(InputMethod.TTS)}><SpeakerIcon className="h-5 w-5"/> Text-to-Speech</button>
                <button type="button" onClick={() => setInputMethod(InputMethod.AUDIO_FILE)} className={tabClass(InputMethod.AUDIO_FILE)}><UploadIcon className="h-5 w-5"/> Upload Audio</button>
              </nav>
            </div>
        )}

        {testType === TestType.READING && (
            <div className="border-b border-slate-200 mb-4">
               <div className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-t-lg border-b-2 border-purple-500 text-purple-600 bg-purple-50 w-max">
                   <BookIcon className="h-5 w-5" /> Reading Passage
               </div>
            </div>
        )}

        <div className="mt-6">
          {inputMethod === InputMethod.TEXT && (
            <textarea 
                value={script} 
                onChange={(e) => setScript(e.target.value)} 
                rows={10} 
                placeholder={testType === TestType.READING ? "Paste the reading passage here..." : "Paste your script here..."} 
                className="w-full p-4 text-base border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
            ></textarea>
          )}
          
          {inputMethod === InputMethod.AUDIO_FILE && testType === TestType.LISTENING && (
             <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <UploadIcon className="h-12 w-12 text-slate-400 mb-4" />
                <label htmlFor="audio-upload" className="cursor-pointer">
                    <span className="text-purple-600 font-semibold text-lg hover:underline">Click to upload</span>
                    <span className="text-slate-500 text-lg"> or drag and drop</span>
                </label>
                <p className="text-sm text-slate-500 mt-2">MP3, WAV, or AAC (Max 10MB)</p>
                <input 
                    id="audio-upload" 
                    type="file" 
                    accept="audio/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
                {audioFile && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 text-purple-900 shadow-sm">
                        <SpeakerIcon className="h-5 w-5" />
                        <span className="font-medium">{audioFile.name}</span>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>
                )}
             </div>
          )}

          {inputMethod === InputMethod.TTS && testType === TestType.LISTENING && (
             <div className="space-y-6">
                <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={8} placeholder={ttsConfig.mode === 'multi' ? "Enter script with speaker names, e.g.\n\nSarah: Hello, how are you?\nTom: I'm doing great, thanks!" : "Enter the script for the single speaker here..."} className="w-full p-4 text-base border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"></textarea>
                <fieldset className="border p-4 rounded-lg border-slate-300">
                    <legend className="text-base font-medium text-slate-700 px-2">Speaker Mode</legend>
                    <div className="flex items-center gap-8 mt-2 text-base">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="speaker-mode" value="single" checked={ttsConfig.mode === 'single'} onChange={() => setTtsConfig({ mode: 'single', voice: TTSVoiceName.KORE })} className="focus:ring-purple-500 h-5 w-5 text-purple-600 border-slate-400" />
                            Single Speaker
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="speaker-mode" value="multi" checked={ttsConfig.mode === 'multi'} onChange={() => setTtsConfig({mode: 'multi', speaker1: {name: '', voice: TTSVoiceName.KORE}, speaker2: {name: '', voice: TTSVoiceName.PUCK}})} className="focus:ring-purple-500 h-5 w-5 text-purple-600 border-slate-400"/>
                            Multi-speaker (2)
                        </label>
                    </div>
                </fieldset>
                {ttsConfig.mode === 'single' && (
                    <div>
                        <label htmlFor="voice" className="block text-base font-medium text-slate-700 mb-2">Voice</label>
                        <select id="voice" value={ttsConfig.voice} onChange={(e) => {
                          if (ttsConfig.mode === 'single') {
                            setTtsConfig({ ...ttsConfig, voice: e.target.value as TTSVoiceName });
                          }
                        }} className="w-full p-3 text-base border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white">
                           {Object.entries(VoiceFriendlyNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                        </select>
                    </div>
                )}
                {ttsConfig.mode === 'multi' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <fieldset className="border p-4 rounded-lg border-slate-300">
                            <legend className="text-base font-medium text-slate-700 px-2">Speaker 1</legend>
                            <div className="space-y-3 mt-2">
                                <div>
                                    <label htmlFor="s1-name" className="block text-sm font-medium text-slate-600">Name (in script) <span className="text-red-500">*</span></label>
                                    <input type="text" id="s1-name" value={ttsConfig.speaker1.name} onChange={(e) => handleMultiSpeakerChange('speaker1', 'name', e.target.value)} onBlur={(e) => handleSpeakerNameBlur('speaker1', e.target.value)} placeholder="e.g., Sarah" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-base" />
                                </div>
                                <div>
                                    <label htmlFor="s1-voice" className="block text-sm font-medium text-slate-600">Voice</label>
                                    <select id="s1-voice" value={ttsConfig.speaker1.voice} onChange={(e) => handleMultiSpeakerChange('speaker1', 'voice', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-base bg-white">
                                        {Object.entries(VoiceFriendlyNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset className="border p-4 rounded-lg border-slate-300">
                            <legend className="text-base font-medium text-slate-700 px-2">Speaker 2</legend>
                            <div className="space-y-3 mt-2">
                                <div>
                                    <label htmlFor="s2-name" className="block text-sm font-medium text-slate-600">Name (in script) <span className="text-red-500">*</span></label>
                                    <input type="text" id="s2-name" value={ttsConfig.speaker2.name} onChange={(e) => handleMultiSpeakerChange('speaker2', 'name', e.target.value)} onBlur={(e) => handleSpeakerNameBlur('speaker2', e.target.value)} placeholder="e.g., Tom" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-base" />
                                </div>
                                <div>
                                    <label htmlFor="s2-voice" className="block text-sm font-medium text-slate-600">Voice</label>
                                    <select id="s2-voice" value={ttsConfig.speaker2.voice} onChange={(e) => handleMultiSpeakerChange('speaker2', 'voice', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-base bg-white">
                                       {Object.entries(VoiceFriendlyNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>

      <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-semibold text-indigo-700 border-b-2 border-indigo-100 pb-4 mb-6">Step 3: Configure Quiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="num-questions" className="block text-base font-medium text-slate-700 mb-2">Number of Questions</label>
            <input type="number" id="num-questions" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)))} min="1" className="w-full text-base px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-base font-medium text-slate-700 mb-2">Difficulty Level</label>
            <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white">
              {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button type="submit" disabled={!isFormValid} className="inline-flex items-center gap-3 px-8 py-3 border border-transparent text-lg font-semibold rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105">
          <GenerateIcon className="h-6 w-6"/>
          Generate Quiz
        </button>
      </div>
    </form>
  );
};

export default InputStage;
