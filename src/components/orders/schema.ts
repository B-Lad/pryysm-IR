import { z } from 'zod';

export const newOrderSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  orderNumber: z.string().min(1, 'Order number is required'),
  projectCode: z.string().min(1, 'Project code is required'),
  items: z.number().min(1, 'At least one item is required'),
  printerTech: z.string().min(1, 'Printer technology is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(['low', 'medium', 'high']),
  salesPerson: z.string().min(1, 'Sales person is required'),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});