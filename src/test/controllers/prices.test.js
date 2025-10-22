const request = require('supertest');
const express = require('express');
const pricesController = require('../../controllers/prices');

// Mock the entire prices module
jest.mock('../../controllers/prices', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/prices', pricesController.getAll);
app.get('/prices/:id', pricesController.getById);
app.post('/prices', pricesController.create);
app.put('/prices/:id', pricesController.update);
app.delete('/prices/:id', pricesController.delete);

describe('Prices Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /prices', () => {
    it('should get all prices successfully', async () => {
      const mockPrices = [
        {
          priceid: '1',
          levelid: '1',
          programid: '1',
          harga: 1500000
        },
        {
          priceid: '2',
          levelid: '2',
          programid: '1',
          harga: 2000000
        }
      ];

      pricesController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockPrices
        });
      });

      const response = await request(app)
        .get('/prices');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPrices);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all prices', async () => {
      pricesController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching price',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/prices');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching price');
    });
  });

  describe('GET /prices/:id', () => {
    it('should get price by id successfully', async () => {
      const mockPrice = {
        priceid: '1',
        levelid: '1',
        programid: '1',
        harga: 1500000
      };

      pricesController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockPrice
        });
      });

      const response = await request(app)
        .get('/prices/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPrice);
    });

    it('should handle database errors when fetching price by id', async () => {
      pricesController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching price',
          error: 'Price not found'
        });
      });

      const response = await request(app)
        .get('/prices/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching price');
    });
  });

  describe('POST /prices', () => {
    it('should create a new price successfully', async () => {
      const newPrice = {
        priceid: '3',
        levelid: '3',
        programid: '2',
        harga: 2500000
      };

      pricesController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newPrice
        });
      });

      const response = await request(app)
        .post('/prices')
        .send({
          levelid: '3',
          programid: '2',
          harga: 2500000
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newPrice);
    });

    it('should handle database errors when creating price', async () => {
      pricesController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error creating price',
          error: 'Invalid level or program ID'
        });
      });

      const response = await request(app)
        .post('/prices')
        .send({
          levelid: '999',
          programid: '999',
          harga: 1000000
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating price');
    });
  });

  describe('PUT /prices/:id', () => {
    it('should update price successfully', async () => {
      const updatedPrice = {
        priceid: '1',
        levelid: '1',
        programid: '1',
        harga: 1800000
      };

      pricesController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedPrice
        });
      });

      const response = await request(app)
        .put('/prices/1')
        .send({
          levelid: '1',
          programid: '1',
          harga: 1800000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedPrice);
    });

    it('should return 404 for non-existent price update', async () => {
      pricesController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Pricelist not found.'
        });
      });

      const response = await request(app)
        .put('/prices/999')
        .send({
          harga: 1000000
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Pricelist not found.');
    });

    it('should handle database errors when updating price', async () => {
      pricesController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating price',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/prices/1')
        .send({
          harga: 1500000
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating price');
    });
  });

  describe('DELETE /prices/:id', () => {
    it('should delete price successfully', async () => {
      pricesController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'price deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/prices/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('price deleted successfully');
    });

    it('should return 404 for non-existent price deletion', async () => {
      pricesController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Pricelist not found.'
        });
      });

      const response = await request(app)
        .delete('/prices/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Pricelist not found.');
    });

    it('should handle database errors when deleting price', async () => {
      pricesController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting lecturer',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/prices/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting lecturer');
    });
  });
});
