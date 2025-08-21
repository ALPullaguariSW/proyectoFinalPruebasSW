const request = require('supertest');
const express = require('express');
const healthRoutes = require('./health');

const app = express();
app.use('/api', healthRoutes);

describe('Health Routes', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Plataforma Reservas Backend');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });
});
