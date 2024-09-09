const express = require('express');
const axios = require('axios');
const path = require('path');
const winston = require('winston');
const ejs = require('ejs');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ],
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware: Log all requests
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Middleware: Disable cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Render the main page
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/api/tarot', async (req, res) => {
    try {
        const tarotCards = [
            { name: '愚者', image: '/images/fool.jpg' },
            { name: '魔术师', image: '/images/magician.jpg' },
            { name: '女祭司', image: '/images/high_priestess.jpg' },
            // Add more tarot cards...
        ];

        const randomCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];

        logger.info(`Selected card: ${randomCard.name}`);

        const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `请为塔罗牌"${randomCard.name}"提供一个简短的占卜解释。` }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const interpretation = gptResponse.data.choices[0].message.content;

        logger.info(`Generated interpretation for ${randomCard.name}`);

        res.json({
            cardName: randomCard.name,
            cardImage: randomCard.image,
            interpretation: interpretation
        });
    } catch (error) {
        logger.error('Error in /api/tarot:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

app.post('/api/tarot/details', async (req, res) => {
    try {
        const { question, cardName } = req.body;

        let prompt = `基于塔罗牌"${cardName}"，`;
        if (question) {
            prompt += `针对问题"${question}"，`;
        }
        prompt += `请提供一个详细的塔罗牌解释，包括卡牌的象征意义、正位和逆位的解释，以及对提问者的建议。`;

        const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const detailedInterpretation = gptResponse.data.choices[0].message.content;
        console.log(detailedInterpretation);

        logger.info(`Generated detailed interpretation for ${cardName}`);

        res.json({ detailedInterpretation });
    } catch (error) {
        logger.error('Error in /api/tarot/details:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});