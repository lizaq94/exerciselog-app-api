import * as bcrypt from 'bcrypt';

export const encryptPassword = async (password: string) => {
  return await bcrypt.hash(password, 13);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
