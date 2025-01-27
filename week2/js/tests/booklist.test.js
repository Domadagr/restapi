import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app'; // Your Express app
require('dotenv').config({ path: '.env.test' });

const sql = require('../db');

let sessionToken = "";

beforeAll(async () => {
  const query = await sql`
    INSERT INTO books (title, author, year, genre)
    VALUES 
      ('Dune', 'Frank Herbert', 1965, 'Science Fiction'),
      ('Neuromancer', 'William Gibson', 1984, 'Cyberpunk'),
      ('The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 1979, 'Science Fiction'),
      ('Hyperion', 'Dan Simmons', 1989, 'Space Opera');
  `;
});


afterAll(async () => {
  const query = await sql`
  TRUNCATE books RESTART IDENTITY CASCADE`;
});

describe('GET /api/books', () => {
  it('should return a list of books', async () => {
    const res = await request(app).get('/api/booklist');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('author');
  });
});

describe('Test login handler', () => {
  describe('POST /api/login with valid credentials', () => {
    it('should log user in', async () => {
      const user = {
        "user": "adminuser",
        "password": "aperture4231"
      };
      const res = await request(app)
        .post('/api/login')
        .send(user)
        .set('Content-Type', 'application/json');
      
      sessionToken = res.body.token;
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /api/login with invalid credentials', () => {
    it('should return status 401', async () => {
      const user = {
        "user": "adminuser",
        "password": "aperture42gt31"
      };
      const res = await request(app)
        .post('/api/login')
        .send(user)
        .set('Content-Type', 'application/json');
      
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('Test add book', () => {
  describe('POST /api/booklist/addbook with valid data', () => {
    it('should return the book added and status 201', async () => {
      const book = {
        "title": "Vitest gone wrong",
        "author": "Mock Vitest",
        "year": 2025,
        "genre": "No help"
      };

      const res = await request(app)
        .post('/api/booklist/addbook')
        .send(book)
        .set('Content-Type', 'application/json')
        .set('authorization', `Bearer ${sessionToken}`);
      
      expect(res.statusCode).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('author');
    });
  });

  describe('POST /api/booklist/addbook without JWT', () => {
    it('should return status 401', async () => {
      const book = {
        "title": "Vitest gone right",
        "author": "Mock Vitest",
        "year": 2025,
        "genre": "No help"
      };

      const res = await request(app)
        .post('/api/booklist/addbook')
        .send(book)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer `);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/booklist/addbook with missing field(s)', () => {
    it('should return status 400', async () => {
      const book = {
        "title": "Vitest gone wrong",
        "author": "Mock Vitest",
        "genre": "No help"
      };

      const res = await request(app)
        .post('/api/booklist/addbook')
        .send(book)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${sessionToken}`);
      
      expect(res.statusCode).toBe(400);
    });
  });
});

describe('Test find book by ID', () => {
    describe('GET /api/booklist/:id with valid ID', () => {
        it('should return the book and status 200', async () => {
            const testId = 2;
            const res = await request(app)
            .get(`/api/booklist/${testId}`)
            .set('Content-type', 'application/json')
            .set('Authorization', `Bearer ${sessionToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('title');
            expect(res.body).toHaveProperty('author');
        })
    });

    describe('GET /api/booklist/:id with unvalid ID', () => {
        it('should return status code 400', async () => {
            const testId = -5;
            const res = await request(app)
            .get(`/api/booklist/${testId}`)
            .set('Content-type', 'application/json')
            .set('Authorization', `Bearer ${sessionToken}`);

            expect(res.statusCode).toBe(400);
        });
    });
});

describe.concurrent('Parallel testing of API', () => {
  it('should return the book given by id 3 and status 200', async () => {
    const testId = 3;
    const res = await request(app)
    .get(`/api/booklist/${testId}`)
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${sessionToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('author');
  })

  it('should return the book given by id 3 and status 200', async () => {
    const testId = 3;
    const res = await request(app)
    .get(`/api/booklist/${testId}`)
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${sessionToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('author');
  })

  it('should return the booklist and status 200', async () => {
    const res = await request(app).get('/api/booklist');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('author');
  });

  it('should update book with id 1 and return status 200', async () => {
    const update = {
      "title": "Dune",
      "author": "Frank Tank",
      "year": 1966,
      "genre": "testing"
    };
    const bookId = 1;
    const res = await request(app)
    .patch(`/api/booklist/patch/${bookId}`)
    .send(update)
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${sessionToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('year', 1966); 
  });

  it('should fail update book with id 2 and return status 400', async () => {
    const update = {
      "title": "Over",
      "author": "Load",
      "year": 2001,
      "genre": "testingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtesting"
    };
    const bookId = 2;
    const res = await request(app)
    .patch(`/api/booklist/patch/${bookId}`)
    .send(update)
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${sessionToken}`);

    expect(res.statusCode).toBe(400);
  }); 
});