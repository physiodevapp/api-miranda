import bcryptjs from 'bcryptjs';
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const checkPassword = (password: string, userPassword: string): Promise<Boolean> => {
  return bcryptjs.compare(password, userPassword);
};