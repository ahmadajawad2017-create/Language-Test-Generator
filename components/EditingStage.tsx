
import React, { useState } from 'react';
import { Quiz, Question, TestType } from '../types';
import { generateHtml } from '../utils/exportHelper';
import { DownloadIcon, ResetIcon } from './Icons';

interface EditingStageProps {
  initialQuiz: Quiz;
  audioDataUrl: string | null;
  onStartOver: () => void;
}

const EditingStage: React.FC<EditingStageProps> = ({ initialQuiz, audioDataUrl, onStartOver }) => {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);

  const handleQuizChange = (field: keyof Quiz, value: any) => {
    setQuiz(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (questionId: string, field: keyof Question, value: any) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q)
    }));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const triggerDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const htmlContent = generateHtml(quiz, audioDataUrl);
    const filename = `${quiz.title.replace(/\s+/g, '_') || 'quiz'}.html`;
    triggerDownload(filename, htmlContent, 'text/html');
  };

  const handleDownloadAnswerKey = () => {
    let keyContent = `Answer Key for: ${quiz.title}\n`;
    if (quiz.author) keyContent += `Author: ${quiz.author}\n`;
    keyContent += `Type: ${quiz.testType}\n`;
    keyContent += "====================================\n\n";

    quiz.questions.forEach((q, i) => {
      keyContent += `Question ${i + 1}: ${q.questionText}\n`;
      keyContent += `Correct Answer: ${q.options[q.correctAnswerIndex]}\n`;
      keyContent += `Explanation: ${q.explanation}\n\n`;
    });
    
    const filename = `${quiz.title.replace(/\s+/g, '_') || 'quiz'}_answer_key.txt`;
    triggerDownload(filename, keyContent, 'text/plain');
  };
  
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center p-6 bg-green-100 text-green-900 rounded-xl shadow-md border border-green-200">
        <h2 className="text-3xl font-bold">Quiz Generated Successfully!</h2>
        <p className="text-lg mt-1">You can now review, edit, and export your quiz.</p>
      </div>

      {audioDataUrl && (
        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3">Audio Preview</h3>
            <audio controls src={audioDataUrl} className="w-full">
                Your browser does not support the audio element.
            </audio>
        </div>
      )}

      {quiz.testType === TestType.READING && quiz.passage && (
        <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
           <h3 className="text-2xl font-semibold text-indigo-700 border-b-2 border-indigo-100 pb-4 mb-4">Reading Passage</h3>
           <textarea 
             value={quiz.passage} 
             onChange={(e) => handleQuizChange('passage', e.target.value)} 
             rows={10} 
             className="w-full p-4 text-base border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 font-serif leading-relaxed"
           />
        </div>
      )}

      <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 space-y-6">
        <h3 className="text-2xl font-semibold text-indigo-700 border-b-2 border-indigo-100 pb-4">Quiz Details</h3>
        <div>
          <label htmlFor="title" className="block text-base font-medium text-slate-700 mb-2">Test Title</label>
          <input type="text" id="title" value={quiz.title} onChange={(e) => handleQuizChange('title', e.target.value)} className="w-full text-base px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label htmlFor="author" className="block text-base font-medium text-slate-700 mb-2">Author</label>
          <input type="text" id="author" value={quiz.author} onChange={(e) => handleQuizChange('author', e.target.value)} className="w-full text-base px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500" />
        </div>
      </div>
      
      <div className="space-y-6">
          <h3 className="text-3xl font-semibold text-indigo-900">Questions</h3>
          {quiz.questions.map((q, qIndex) => (
            <div key={q.id} className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-semibold text-slate-800 mb-2">Question {qIndex + 1}</label>
                        <textarea value={q.questionText} onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)} rows={2} className="w-full p-3 text-base border border-slate-300 rounded-lg" />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-base font-semibold text-slate-700">Options (select correct answer)</label>
                        {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                                <input 
                                    type="radio"
                                    name={`correct-answer-${q.id}`}
                                    checked={q.correctAnswerIndex === oIndex}
                                    onChange={() => handleQuestionChange(q.id, 'correctAnswerIndex', oIndex)}
                                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-400"
                                />
                                <input type="text" value={opt} onChange={(e) => handleOptionChange(q.id, oIndex, e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-base" />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-base font-semibold text-slate-700 mb-2">Explanation (for teacher)</label>
                        <textarea value={q.explanation} onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)} rows={2} className="w-full p-3 text-base border border-slate-300 rounded-lg bg-amber-50" />
                    </div>
                </div>
            </div>
          ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-slate-200">
        <button onClick={onStartOver} className="inline-flex items-center justify-center gap-2 px-6 py-2 border border-slate-400 text-base font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
            <ResetIcon className="h-5 w-5" />
            Start Over
        </button>
        <button onClick={handleDownloadAnswerKey} className="inline-flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">
            <DownloadIcon className="h-5 w-5" />
            Download Answer Key
        </button>
        <button onClick={handleExportHtml} className="inline-flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
            <DownloadIcon className="h-5 w-5" />
            Export HTML Quiz
        </button>
      </div>
    </div>
  );
};

export default EditingStage;
