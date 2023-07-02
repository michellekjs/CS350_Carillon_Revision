import { Schema, model } from 'mongoose';
import { IAuth } from './auth.interface';

const AuthSchema = new Schema<IAuth>({
  email: {
    type: String,
    required: true,
  },
  authCode: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
  },
});

export const Auth = model<IAuth>('Auth', AuthSchema);
