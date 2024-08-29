import bcryptjs from 'bcryptjs';
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const checkPassword = (password: string, userPassword: string): Promise<Boolean> => {
  return bcryptjs.compare(password, userPassword);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  password = await bcryptjs.hash(password, salt);

  return password
}