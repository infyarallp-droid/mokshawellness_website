import { z } from 'zod';
import { allProgrammes } from './programmes';

// One schema, used by the form (browser) and by the API route (server).

export const MODES = ['No preference', 'Studio', 'Online'] as const;
const slugs = allProgrammes.map((p) => p.slug);

/** Reduce "+91 98765-43210" / "098765 43210" to the 10 digits the admin panel stores. */
export function normalizeMobile(raw: string): string | null {
  let digits = raw.replace(/[\s\-().+]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80, 'Name is too long'),
  mobile: z
    .string()
    .trim()
    .refine((v) => normalizeMobile(v) !== null, 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().max(120).email('Enter a valid email address').or(z.literal('')),
  interest: z.string().refine((v) => v === '' || slugs.includes(v), 'Choose a class from the list'),
  mode: z.enum(MODES),
  message: z.string().trim().max(1000, 'Please keep your message under 1000 characters'),
  /** Honeypot: real visitors never see or fill this field. */
  company: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
