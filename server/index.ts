import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCards, addCard } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/cards', (req, res) => {
  const cards = getCards();
  res.json(cards);
});

app.post('/api/cards', (req, res) => {
  try {
    const newCard = req.body;
    // Basic validation
    if (!newCard.data || !newCard.data.f1) {
      res.status(400).json({ error: 'Invalid card data' });
      return;
    }

    if (!newCard.id) {
      newCard.id = Date.now();
    }

    const addedCard = addCard(newCard);
    res.status(201).json(addedCard);
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));

    // Catch-all route to serve index.html for React routing
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
  });
}

