import { NextApiResponse, NextApiRequest } from "next"

export function corsMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }
  next()
}