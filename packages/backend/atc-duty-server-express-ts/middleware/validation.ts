import * as z from 'zod';
import type { Request, Response, NextFunction } from 'express';

const validate =
  (schema: z.ZodSchema) =>  // ZodSchema 是所有 schema 的基类
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: e.message,
        });
      }
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

export default validate;