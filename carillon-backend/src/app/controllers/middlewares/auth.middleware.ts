import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function checkIsLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.token;

    // if token is not existed
    if (!req.headers.token) {
      return res.status(401).send('User not logged in');
    }

    jwt.verify(
      token as string,
      process.env.JWT_SECRET as string,
      (err, _decoded) => {
        const decoded = _decoded as JwtPayload;
        if (err) {
          return res.status(401).send('Invalid token');
        }
        res.locals.user = { id: decoded.id, type: decoded.type };
        next();
      },
    );
  } catch (error) {
    next(error);
  }
}
