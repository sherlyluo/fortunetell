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
    const API_URL = 'https://tarot-api-worker.xiuxiu-luo.workers.dev';

    drawCardButton.addEventListener('click', async () => {
        const userQuestion = userQuestionInput.value.trim();
        drawCardButton.disabled = true;
        drawCardButton.textContent = '正在抽取...';
        
        try {
            const response = await fetch(`${API_URL}/api/tarot`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userQuestion }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.cardName || !data.cardImage || !data.interpretation) {
                throw new Error('Incomplete data received from server');
            }

            tarotCardsDiv.innerHTML = `<img src="${data.cardImage}" alt="${data.cardName}" />`;
            cardNameP.textContent = `抽到的塔罗牌：${data.cardName}`;
            interpretationP.textContent = data.interpretation;
            moreDetailsButton.style.display = 'inline-block';
            document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            interpretationP.textContent = `抱歉，出现了错误：${error.message}`;
        } finally {
            drawCardButton.disabled = false;
            drawCardButton.textContent = '抽取塔罗牌';
        }
    });

    moreDetailsButton.addEventListener('click', async () => {
        const userQuestion = userQuestionInput.value.trim();
        const cardName = cardNameP.textContent.split('：')[1];
        try {
            loadingSpinner.style.display = 'block';
            detailedInterpretationP.innerHTML = '';
            modal.style.display = 'block';

            const response = await fetch(`${API_URL}/api/tarot/details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userQuestion, cardName: cardName }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.detailedInterpretation) {
                throw new Error('Incomplete data received from server');
            }

            loadingSpinner.style.display = 'none';
            detailedInterpretationP.innerHTML = `
                <strong>您的问题：</strong> ${userQuestion ? userQuestion : '(未提供)'}<br><br>
                <strong>详细解析：</strong><br>${data.detailedInterpretation}
            `;
        } catch (error) {
            console.error('Error:', error);
            loadingSpinner.style.display = 'none';
            detailedInterpretationP.textContent = `抱歉，获取详细解析时出现错误：${error.message}`;
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
