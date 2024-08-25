import * as bcrypt from 'bcrypt';

export const encrypt = async (value: string) => {
  return await bcrypt.hash(value, 13);
};

export const compareValueWithHash = async (value: string, hash: string) => {
  return await bcrypt.compare(value, hash);
};
