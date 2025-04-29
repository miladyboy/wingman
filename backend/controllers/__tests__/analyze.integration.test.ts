const request = require('supertest');
import app from '../../app';

describe('analyze endpoint integration', () => {
  it('returns 401 if user is not authenticated', async () => {
    const res = await request(app)
      .post('/analyze')
      .send({
        historyJson: '[]',
        newMessageText: 'Test message',
        conversationId: 'conv-1'
      });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });
}); 