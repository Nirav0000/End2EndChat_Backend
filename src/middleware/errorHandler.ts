import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: { code: 'CAST_ERROR', message: 'Invalid ID format' } });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: { code: 'DUPLICATE_ERROR', message: 'Duplicate field value entered' } });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }

  res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
};
