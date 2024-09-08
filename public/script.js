document.addEventListener('DOMContentLoaded', () => {
    const drawCardButton = document.getElementById('drawCard');
    const tarotCardsDiv = document.getElementById('tarotCards');
    const cardNameP = document.getElementById('cardName');
    const interpretationP = document.getElementById('interpretation');
    const userQuestionInput = document.getElementById('userQuestion');
    const moreDetailsButton = document.getElementById('moreDetails');
    const modal = document.getElementById('detailsModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const detailedInterpretationP = document.getElementById('detailedInterpretation');
    const loadingSpinner = document.getElementById('loadingSpinner');

    drawCardButton.addEventListener('click', async () => {
        const userQuestion = userQuestionInput.value.trim();
        drawCardButton.disabled = true;
        drawCardButton.textContent = '正在抽取...';
        
        try {
            const response = await fetch('/api/tarot', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userQuestion }),
            });
            const data = await response.json();

            tarotCardsDiv.innerHTML = `<img src="${data.cardImage}" alt="${data.cardName}" />`;
            cardNameP.textContent = `抽到的塔罗牌：${data.cardName}`;
            interpretationP.textContent = data.interpretation;

            // Show the "查看更多" button
            moreDetailsButton.style.display = 'inline-block';

            // Scroll to the result
            document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            interpretationP.textContent = '抱歉，出现了错误，请稍后再试。';
        } finally {
            drawCardButton.disabled = false;
            drawCardButton.textContent = '抽取塔罗牌';
        }
    });

    moreDetailsButton.addEventListener('click', async () => {
        const userQuestion = userQuestionInput.value.trim();
        const cardName = cardNameP.textContent.split('：')[1];

        try {
            // Show loading spinner and hide previous interpretation
            loadingSpinner.style.display = 'block';
            detailedInterpretationP.innerHTML = '';
            modal.style.display = 'block';

            const response = await fetch('/api/tarot/details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userQuestion, cardName: cardName }),
            });
            const data = await response.json();

            // Hide loading spinner and show interpretation
            loadingSpinner.style.display = 'none';
            detailedInterpretationP.innerHTML = `
                <strong>您的问题：</strong> ${userQuestion ? userQuestion : '(未提供)'}<br><br>
                <strong>详细解析：</strong><br>${data.detailedInterpretation}
            `;
        } catch (error) {
            console.error('Error:', error);
            loadingSpinner.style.display = 'none';
            detailedInterpretationP.textContent = '抱歉，获取详细解析时出现错误，请稍后再试。';
        }
    });

    closeModal.onclick = () => {
        modal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});