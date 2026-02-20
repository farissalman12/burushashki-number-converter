document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("converterForm");
    const inputField = document.getElementById("number-input");
    const resultContainer = document.getElementById("result-container");
    const mathContainer = document.getElementById("math-container");

    const colorMap = {
        'multiplier': 'primary', 
        'base': 'emerald-500',
        'remainder': 'amber-500',
        'unit': 'emerald-500'
    };

    function getColorClass(type) {
        return colorMap[type] || 'slate-500';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = inputField.value;
        if (!input) {
            resultContainer.innerHTML = '';
            mathContainer.innerHTML = '';
            return;
        }

        try {
            const num = Number(input);
            const tokens = convert(num);
            
            renderTokens(tokens);
            renderMath(tokens, num);
        } catch(error) {
            resultContainer.innerHTML = `<div class="text-xl text-red-500 font-bold">${error.message}</div>`;
            mathContainer.innerHTML = '';
        }
    });

    function renderTokens(tokens) {
        resultContainer.innerHTML = '';
        tokens.forEach(token => {
            if (token.type === 'separator') {
                resultContainer.innerHTML += `
                    <div class="text-slate-400 dark:text-slate-600 text-3xl font-light select-none">
                        ${token.word}
                    </div>
                `;
            } else if (token.type === 'operator') {
                // If it's a word operator like 'ke' (And), display the word not just '+'
                // But wait, the exact word is 'ke'. Let's show it as a simple text node because it's not hoverable (or maybe it is?)
                // Actually, 'operator' had values from our generator! `createToken("ke", "And", "operator", "+", null)`
                const color = getColorClass(token.type);
                resultContainer.innerHTML += `
                <div class="tooltip-trigger relative group cursor-help border-b-2 border-dotted border-slate-300 dark:border-slate-600 hover:text-slate-500 pb-1 transition-colors">
                    <span>${token.word}</span>
                    <div class="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl p-4 shadow-2xl opacity-0 invisible transition-opacity duration-200 z-50 pointer-events-none">
                        <div class="flex justify-between items-start mb-2 border-b border-slate-700 dark:border-slate-200 pb-2">
                            <span class="font-bold text-lg">${token.word}</span>
                            <span class="text-xs bg-slate-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">${token.type}</span>
                        </div>
                        <div class="space-y-1 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-400 dark:text-slate-500">English:</span>
                                <span class="font-medium">${token.english}</span>
                            </div>
                        </div>
                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-2 border-8 border-transparent border-t-slate-900 dark:border-t-white"></div>
                    </div>
                </div>`;
            } else {
                const color = getColorClass(token.type);
                const textCol = color === 'primary' ? 'text-primary' : `text-${color}`;
                const bgCol = color === 'primary' ? 'bg-primary' : `bg-${color}`;

                resultContainer.innerHTML += `
                <div class="tooltip-trigger relative group cursor-help border-b-2 border-dotted border-slate-300 dark:border-slate-600 hover:border-primary pb-1 transition-colors">
                    <span>${token.word}</span>
                    <div class="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl p-4 shadow-2xl opacity-0 invisible transition-opacity duration-200 z-50 pointer-events-none">
                        <div class="flex justify-between items-start mb-2 border-b border-slate-700 dark:border-slate-200 pb-2">
                            <span class="font-bold text-lg">${token.word}</span>
                            <span class="text-xs ${bgCol} text-white px-1.5 py-0.5 rounded uppercase tracking-wider">${token.type}</span>
                        </div>
                        <div class="space-y-1 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-400 dark:text-slate-500">English:</span>
                                <span class="font-medium">${token.english}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-400 dark:text-slate-500">Operation:</span>
                                <span class="font-mono ${textCol} font-bold">${token.op}</span>
                            </div>
                        </div>
                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-2 border-8 border-transparent border-t-slate-900 dark:border-t-white"></div>
                    </div>
                </div>`;
            }
        });
    }

    function renderMath(tokens, totalNum) {
        mathContainer.innerHTML = '';
        
        let mathBlocks = [];
        let hasValues = false;

        tokens.forEach(token => {
            if (token.type !== 'separator' && token.type !== 'operator' && token.val !== null) {
                hasValues = true;
                const color = getColorClass(token.type);
                const textCol = color === 'primary' ? 'text-primary' : `text-${color}`;
                
                mathBlocks.push(`
                    <div class="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <span class="text-2xl font-bold ${textCol}">${token.val}</span>
                        <span class="text-xs text-slate-400 mt-1 capitalize">${token.type}</span>
                    </div>
                `);

                if (token.type === 'multiplier') {
                     mathBlocks.push('<span class="text-slate-400 text-xl font-bold">×</span>');
                } else if (token.type === 'base') {
                     mathBlocks.push('<span class="text-slate-400 text-xl font-bold">+</span>');
                }
            } else if (token.type === 'operator') {
                 mathBlocks.push('<span class="text-slate-400 text-xl font-bold">+</span>');
            }
        });

        if (!hasValues) return;

        let htmlStr = mathBlocks.join("");
        // Clean trailing and consecutive duplicated math signs (e.g. at end of calculation or next to each other organically)
        htmlStr = htmlStr.replace(/(<span class="text-slate-400 text-xl font-bold">\+<\/span>\s*)+$/g, ""); 
        htmlStr = htmlStr.replace(/(<span class="text-slate-400 text-xl font-bold">×<\/span>\s*)+$/g, ""); 
        htmlStr = htmlStr.replace(/(<span class="text-slate-400 text-xl font-bold">\+<\/span>\s*){2,}/g, '<span class="text-slate-400 text-xl font-bold">+</span>');

        htmlStr += `
            <span class="text-slate-400 text-2xl font-bold">=</span>
            <div class="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-transparent dark:border-slate-700">
                <span class="text-2xl font-bold text-slate-900 dark:text-white">${totalNum}</span>
                <span class="text-xs text-slate-400 mt-1">Total</span>
            </div>
        `;

        mathContainer.innerHTML = htmlStr;
    }
});
