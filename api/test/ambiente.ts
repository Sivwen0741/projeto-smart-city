import { randomBytes } from 'crypto';

process.env.JWT_SEGREDO ??= randomBytes(32).toString('hex');
