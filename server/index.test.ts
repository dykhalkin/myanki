import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

import { app } from './index.js';
import { resetCards, INITIAL_CARDS } from './db.js';


describe('Cards API', () => {
  beforeEach(() => {
    resetCards(INITIAL_CARDS);
  });

  it('GET /api/cards should return all cards', async () => {
    const response = await request(app).get('/api/cards');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Initial data has 2 cards
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/cards should add a new card', async () => {
    const newCard = {
      deckId: 'd1',
      data: {
        f1: 'Testword',
        f2: 'Test translation',
        f3: 'Test context',
        f4: 'Der',
        f5: 'Test notes',
      },
      status: 'new',
      nextReview: Date.now(),
    };

    const response = await request(app).post('/api/cards').send(newCard);

    expect(response.status).toBe(201);
    expect(response.body.data.f1).toBe('Testword');
    expect(response.body.id).toBeDefined();

    // Verify it was actually added
    const getResponse = await request(app).get('/api/cards');
    const added = getResponse.body.find((c: any) => c.data.f1 === 'Testword');
    expect(added).toBeDefined();
  });

  it('POST /api/cards should return 400 for invalid data', async () => {
    const invalidCard = {
      data: {
        // missing f1
        f2: 'Oops',
      },
    };

    const response = await request(app).post('/api/cards').send(invalidCard);

    expect(response.status).toBe(400);
  });
});
