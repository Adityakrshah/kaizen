import { Request, Response, NextFunction } from "express"
import { ZodTypeAny } from "zod"

type ValidationResult = {
  body?: any
  query?: any
  params?: any
}

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      }) as ValidationResult

      req.body = validatedData.body ?? req.body
      req.query = validatedData.query ?? req.query
      req.params = validatedData.params ?? req.params

      next()
    } catch (error) {
      next(error)
    }
  }
}