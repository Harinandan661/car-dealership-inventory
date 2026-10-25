import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';

let token = '';
let vehicleId = '';

beforeAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await request(app).post('/api/auth/register').send({ email: 'a@a.com', password: 'pass1234' });
  const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'pass1234' });
  token = res.body.token;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('Auth', () => {
  it('rejects bad login', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('Vehicles', () => {
  it('requires auth', async () => {
    const res = await request(app).post('/api/vehicles').send({});
    expect(res.status).toBe(401);
  });

  it('creates a vehicle', async () => {
    const res = await request(app).post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 3 });
    expect(res.status).toBe(201);
    vehicleId = res.body.id;
  });

  it('lists vehicles', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('searches by make', async () => {
    const res = await request(app).get('/api/vehicles/search?make=Toyota').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body[0].make).toBe('Toyota');
  });

  it('purchases and decrements', async () => {
    const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(2);
  });

  it('cannot purchase at zero', async () => {
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 0 } });
    const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
