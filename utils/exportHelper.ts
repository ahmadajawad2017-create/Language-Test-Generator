
import { Quiz } from '../types';

export const generateHtml = (quiz: Quiz, audioDataUrl: string | null): string => {
  const quizJson = JSON.stringify(quiz);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${quiz.title || 'Quiz'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 flex items-center justify-center min-h-screen p-4 font-sans text-slate-800">
    <div id="quiz-container" class="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-3xl border border-slate-200 my-8">
        <!-- Quiz content will be injected here -->
    </div>

    <script id="quiz-data" type="application/json">
        ${quizJson}
    </script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const quizContainer = document.getElementById('quiz-container');
            const quizData = JSON.parse(document.getElementById('quiz-data').textContent);

            let content = \`
                <h1 class="text-4xl font-bold text-indigo-900 text-center mb-2">\${quizData.title}</h1>
            \`;

            if (quizData.author) {
                content += \`<p class="text-center text-slate-600 mb-8 text-lg">By \${quizData.author}</p>\`;
            }

            ${audioDataUrl ? `
                content += \`
                    <div class="mb-8">
                        <audio controls class="w-full" src="${audioDataUrl}"></audio>
                    </div>
                \`;
            ` : ''}

            if (quizData.passage) {
                 content += \`
                    <div class="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                        <h3 class="text-xl font-bold text-slate-700 mb-3 border-b pb-2">Reading Passage</h3>
                        <div class="prose max-w-none text-slate-800 font-serif leading-relaxed whitespace-pre-wrap">\${quizData.passage}</div>
                    </div>
                \`;
            }

            content += '<form id="quiz-form" class="space-y-8">';

            quizData.questions.forEach((q, qIndex) => {
                content += \`
                    <div class="question-block" id="question-\${qIndex}">
                        <p class="text-xl font-semibold text-slate-800 mb-4">\${qIndex + 1}. \${q.questionText}</p>
                        <div class="space-y-3 pl-2">
                \`;
                q.options.forEach((opt, oIndex) => {
                    content += \`
                        <label class="flex items-center p-4 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-purple-50 has-[:checked]:border-purple-400">
                            <input type="radio" name="question-\${qIndex}" value="\${oIndex}" class="h-5 w-5 text-purple-600 border-slate-400 focus:ring-purple-500 mr-4">
                            <span class="text-slate-800 text-base">\${opt}</span>
                        </label>
                    \`;
                });
                content += \`</div><div class="result-feedback mt-3 text-sm font-medium"></div></div>\`;
            });
            
            content += \`
                <button type="submit" class="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors text-lg">
                    Submit Answers
                </button>
            \`;
            content += '</form>';
            
            content += \`<div id="final-score" class="text-center mt-8 p-6 bg-indigo-100 text-indigo-900 rounded-lg text-3xl font-bold hidden"></div>\`;

            quizContainer.innerHTML = content;

            document.getElementById('quiz-form').addEventListener('submit', (e) => {
                e.preventDefault();
                let score = 0;
                const form = e.target;

                quizData.questions.forEach((q, qIndex) => {
                    const selected = form.querySelector(\`input[name="question-\${qIndex}"]:checked\`);
                    const questionBlock = document.getElementById(\`question-\${qIndex}\`);
                    const optionsLabels = questionBlock.querySelectorAll('label');

                    optionsLabels.forEach((label, oIndex) => {
                        label.classList.remove('cursor-pointer', 'hover:bg-slate-50');
                        const input = label.querySelector('input');
                        if (input) input.disabled = true;

                        if (q.correctAnswerIndex === oIndex) {
                            label.classList.remove('bg-purple-50', 'border-purple-400');
                            label.classList.add('bg-green-100', 'border-green-400');
                        }
                    });

                    if (selected) {
                        const selectedLabel = selected.parentElement;
                        const selectedValue = parseInt(selected.value, 10);
                        if (selectedValue === q.correctAnswerIndex) {
                            score++;
                        } else {
                            selectedLabel.classList.remove('bg-purple-50', 'border-purple-400');
                            selectedLabel.classList.add('bg-red-100', 'border-red-400');
                        }
                    }
                });

                const finalScoreEl = document.getElementById('final-score');
                finalScoreEl.innerHTML = \`You got \${score} out of \${quizData.questions.length} correct!\`;
                finalScoreEl.classList.remove('hidden');

                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.classList.add('bg-slate-400', 'cursor-not-allowed', 'hover:bg-slate-400');
            });
        });
    </script>
</body>
</html>
`;
};
