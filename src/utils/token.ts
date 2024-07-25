import jwt from 'jsonwebtoken';

interface DecodedToken {
  sub: {
    email: string;
    password: string;
  } | string;
}

export const generateToken = (payload: { email: string, password: string }) => {
  const secretKey: string = process.env.SECRET_KEY || 'exAmpL3_seCreT_K3y';

  const token = jwt.sign({ sub: payload }, secretKey, { expiresIn: '1h' });

  return token;
};

export const verifyToken = (token: string) => {
  const decoded = jwt.verify(token, process.env.SECRET_KEY || 'exAmpL3_seCreT_K3y') as DecodedToken;

  return decoded;
}