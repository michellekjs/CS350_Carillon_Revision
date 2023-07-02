/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { Auth, User } from '../schemas';
import { compareSync, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../util/logger';
import { generateAuthCode, sendEmail } from '../util/email.authentication';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findOne({
      userId: req.body.userId,
    });
    if (user) {
      return res.status(409).send('Duplicate user id');
    }

    const savedUser = await User.create({
      userId: req.body.userId,
      password: hashSync(req.body.password, 10),
      userName: req.body.userName,
    });
    res.json(savedUser.toJSON());
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findOne({
      userId: req.body.userId,
    });
    if (!user) {
      return res.status(401).send('Invalid user id');
    }

    if (!compareSync(req.body.password, user.password)) {
      return res.status(401).send('Invalid password');
    }
    const token = jwt.sign(
      { id: user._id, type: user.userType },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' },
    );
    res.json({ ...user.toJSON(), token: token });
  } catch (error) {
    next(error);
  }
}

export async function checkInformation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(401).send('Invalid user id');
    }
    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
}

export async function editInformation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      userId: req.body.userId,
      password: req.body.password,
      userName: req.body.userName,
    });
    if (!user) {
      return res.status(401).send('Invalid user id');
    }
    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
}

export async function sendEmailVerification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authCode = generateAuthCode();
    await Auth.updateOne(
      {
        email: req.body.email,
      },
      {
        authCode: authCode,
        created_at: new Date(),
      },
      {
        upsert: true,
        new: true,
      },
    );

    setTimeout(async () => {
      await Auth.deleteOne({
        email: req.body.email,
      });
    }, 30 * 60 * 1000);
    await sendEmail(req.body.email, authCode);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = await Auth.findOne({
      email: req.body.email,
    });
    if (!auth) {
      return res.sendStatus(401).send('Invalid email');
    }
    if (auth.authCode != req.body.authCode) {
      return res.sendStatus(401).send('Invalid auth code');
    }
    await Auth.deleteOne({ email: req.body.email });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
