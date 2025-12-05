import { compare, hash } from 'bcrypt';


//--------------------------------------------------Generate Hash
export const generateHash = async (
  plainText: string,
  saltRound: number = Number(process.env.SALT_ROUND),
): Promise<string> => {
  return await hash(plainText, saltRound);
};

//----------------------------------------------------Compare Hash
export const compareHash = async (
  plainText: string,
  cipherText: string,
): Promise<boolean> => {
  return await compare(plainText, cipherText);
};