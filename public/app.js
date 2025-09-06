// public/app.js - UPGRADED WITH PRO-LEVEL UX

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('link-form');
    const resultContainer = document.getElementById('result-container');
    const resultUrlSpan = document.getElementById('result-url');
    const copyBtn = document.getElementById('copy-btn');
    const addRuleBtn = document.getElementById('add-rule-btn');
    const rulesContainer = document.getElementById('time-rules-container');

    const addRuleInput = () => {
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'rule-group';
        ruleDiv.innerHTML = `
            <input type="number" class="time-input" placeholder="Start" min="0" max="23" required title="Start hour (0-23)">
            <span class="text-secondary">-</span>
            <input type="number" class="time-input" placeholder="End" min="1" max="24" required title="End hour (1-24)">
            <input type="url" class="url-input" placeholder="https://your-url.com/for-this-slot" required>
            <button type="button" class="remove-rule-btn" title="Remove rule"><i class="fa-solid fa-trash-can"></i></button>
        `;
        rulesContainer.appendChild(ruleDiv);
        ruleDiv.querySelector('.remove-rule-btn').addEventListener('click', () => ruleDiv.remove());
    };

    addRuleBtn.addEventListener('click', addRuleInput);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;

        const defaultUrl = document.getElementById('defaultUrl').value;
        const timeRules = [];
        rulesContainer.querySelectorAll('.rule-group').forEach(group => {
            const inputs = group.querySelectorAll('input');
            const startHour = parseInt(inputs[0].value), endHour = parseInt(inputs[1].value), url = inputs[2].value;
            if (!isNaN(startHour) && !isNaN(endHour) && url) timeRules.push({ startHour, endHour, url });
        });

        try {
            const response = await fetch('/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ defaultUrl, timeRules })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            
            resultUrlSpan.textContent = result.shortUrl;
            resultContainer.classList.remove('hidden');
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            submitBtn.innerHTML = '<i class="fa-solid fa-magic-wand-sparkles"></i> Create Smart Link';
            submitBtn.disabled = false;
        }
    });
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(resultUrlSpan.textContent);
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => { copyBtn.innerHTML = originalIcon; }, 1500);
    });

    addRuleInput(); // Start with one rule by default
});