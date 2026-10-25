import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const vehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
});

router.post('/', async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const v = await prisma.vehicle.create({ data: parsed.data });
  res.status(201).json(v);
});

router.get('/', async (_req, res) => {
  const vs = await prisma.vehicle.findMany({ where: { quantity: { gt: 0 } } });
  res.json(vs);
});

router.get('/search', async (req, res) => {
  const { make, model, category, minPrice, maxPrice } = req.query as any;
  const where: any = {};
  if (make) where.make = { contains: make };
  if (model) where.model = { contains: model };
  if (category) where.category = { contains: category };
  if (minPrice || maxPrice) where.price = {};
  if (minPrice) where.price.gte = Number(minPrice);
  if (maxPrice) where.price.lte = Number(maxPrice);
  const vs = await prisma.vehicle.findMany({ where });
  res.json(vs);
});

router.put('/:id', async (req, res) => {
  try {
    const v = await prisma.vehicle.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json(v);
  } catch { res.status(404).json({ error: 'Not found' }); }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await prisma.vehicle.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch { res.status(404).json({ error: 'Not found' }); }
});

router.post('/:id/purchase', async (req, res) => {
  const v = await prisma.vehicle.findUnique({ where: { id: String(req.params.id) } });
  if (!v) return res.status(404).json({ error: 'Not found' });
  if (v.quantity <= 0) return res.status(400).json({ error: 'Out of stock' });
  const updated = await prisma.vehicle.update({ where: { id: v.id }, data: { quantity: { decrement: 1 } } });
  res.json(updated);
});

router.post('/:id/restock', adminOnly, async (req, res) => {
  const amount = Number(req.body.amount ?? 1);
  const updated = await prisma.vehicle.update({
    where: { id: String(req.params.id) },
    data: { quantity: { increment: amount } },
  });
  res.json(updated);
});

export default router;
