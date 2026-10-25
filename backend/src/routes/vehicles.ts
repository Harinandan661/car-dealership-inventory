import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

const vehicleSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
});

const vehicleUpdateSchema = vehicleSchema.partial();

// 1. GET /api/vehicles/search (Must precede /:id)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query as Record<string, string | undefined>;
    const where: any = {};

    if (make) where.make = { contains: make };
    if (model) where.model = { contains: model };
    if (category) where.category = { contains: category };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        where.price.gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        where.price.lte = Number(maxPrice);
      }
    }

    const vehicles = await prisma.vehicle.findMany({ where });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search vehicles' });
  }
});

// 2. GET /api/vehicles - Returns all inventory so frontend can show out-of-stock items as disabled
router.get('/', async (_req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// 3. POST /api/vehicles - Add new vehicle (Admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  try {
    const vehicle = await prisma.vehicle.create({ data: parsed.data });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// 4. PUT /api/vehicles/:id - Update vehicle (Admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  const parsed = vehicleUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: String(req.params.id) },
      data: parsed.data,
    });
    res.json(vehicle);
  } catch (error) {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

// 5. DELETE /api/vehicles/:id - Delete vehicle (Admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    await prisma.vehicle.delete({
      where: { id: String(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

// 6. POST /api/vehicles/:id/purchase - Decrease quantity
router.post('/:id/purchase', async (req: Request, res: Response) => {
  const id = String(req.params.id);

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Out of stock' });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { quantity: { decrement: 1 } },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// 7. POST /api/vehicles/:id/restock - Increase quantity (Admin only)
router.post('/:id/restock', adminOnly, async (req: Request, res: Response) => {
  const amount = Number(req.body.amount ?? 1);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Restock amount must be a positive number' });
  }

  try {
    const updated = await prisma.vehicle.update({
      where: { id: String(req.params.id) },
      data: { quantity: { increment: amount } },
    });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

export default router;