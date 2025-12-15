
import React from 'react';
import { BookIcon, SpeakerIcon, DownloadIcon, UploadIcon, GenerateIcon } from './Icons';

interface UserManualProps {
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">?</span>
            User Manual & Guide
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full p-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 text-slate-700 leading-relaxed">
          <section className="mb-8">
            <h3 className="text-xl font-bold text-indigo-800 mb-3 border-b pb-2">Welcome</h3>
            <p className="mb-4">
              The <strong>Language Test Generator</strong> is an AI-powered tool designed for educators to create high-quality Listening and Reading comprehension quizzes in minutes.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
             <section className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-bold text-indigo-700 mb-3 flex items-center gap-2">
                    <SpeakerIcon className="h-5 w-5"/> 1. Listening Tests
                </h3>
                <p className="text-sm mb-3">Create tests based on audio content. You have three input methods:</p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li><strong>Script Text:</strong> Paste a transcript. The AI generates questions based on the text.</li>
                    <li><strong>Text-to-Speech (TTS):</strong>
                        <ul className="list-circle pl-4 mt-1 space-y-1 text-slate-600">
                            <li><em>Single Speaker:</em> Good for announcements/news.</li>
                            <li><em>Multi-speaker:</em> Good for conversations. Format scripts like "Sarah: Hi! / Tom: Hello."</li>
                        </ul>
                    </li>
                    <li><strong>Upload Audio:</strong> Upload MP3/WAV files directly. The AI listens to the file to generate questions.</li>
                </ul>
             </section>

             <section className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
                    <BookIcon className="h-5 w-5"/> 2. Reading Tests
                </h3>
                <p className="text-sm mb-3">Create tests based on written passages.</p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Select the <strong>Reading Skill</strong> tab.</li>
                    <li>Paste any article, story, or essay into the text area.</li>
                    <li>The AI focuses on reading skills like inference, main ideas, and vocabulary.</li>
                    <li>The Reading Passage will be included in the final exported quiz.</li>
                </ul>
             </section>
          </div>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-indigo-800 mb-3 border-b pb-2">3. Configuration & Generation</h3>
            <ul className="space-y-3">
                <li className="flex gap-3">
                    <div className="min-w-[24px]"><GenerateIcon className="text-indigo-600 h-6 w-6"/></div>
                    <div>
                        <strong>Difficulty:</strong> Choose <em>Easy, Medium, or Hard</em> to adjust the complexity of vocabulary and distractors (incorrect answers).
                    </div>
                </li>
                <li className="flex gap-3">
                    <div className="min-w-[24px] font-bold text-indigo-600 text-lg text-center w-6">#</div>
                    <div>
                        <strong>Question Count:</strong> Specify how many multiple-choice questions you need.
                    </div>
                </li>
            </ul>
          </section>

          <section className="mb-8">
             <h3 className="text-xl font-bold text-indigo-800 mb-3 border-b pb-2">4. Editing & Exporting</h3>
             <p className="mb-4">After generation, you enter the Editing Stage:</p>
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg text-green-700"><span className="font-bold">Edit</span></div>
                    <p className="text-sm mt-1">Review questions. You can rewrite the text, change options, select a different correct answer, or modify the teacher's explanation.</p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><DownloadIcon className="h-5 w-5"/></div>
                    <div>
                        <p className="text-sm mt-1 font-semibold">Export Options:</p>
                        <ul className="list-disc pl-5 mt-1 text-sm text-slate-600 space-y-1">
                            <li><strong>HTML Quiz:</strong> A standalone interactive file. Send this to students. It works offline and contains the audio/passage.</li>
                            <li><strong>Answer Key:</strong> A text file for teachers containing the correct answers and explanations.</li>
                        </ul>
                    </div>
                </div>
             </div>
          </section>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-1">Tip</h4>
            <p className="text-sm text-amber-900">
                Always review the generated content for accuracy before sharing it with students. AI is a helpful assistant but requires human oversight.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm">
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
