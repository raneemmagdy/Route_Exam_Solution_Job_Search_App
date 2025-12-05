import * as CryptoJS from "crypto-js";

//-------------------------------------------Encrypt
export const encrypt = async ({ plainText, secretKey = process.env.ENC_SECRET_KEY as string }: {
    plainText: string,
    secretKey?: string
}
):Promise<string> => {
    return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};

//-------------------------------------------Decrypt
export const decrypt = async ({ciphertext, secretKey= process.env.ENC_SECRET_KEY as string }: {
    ciphertext: string,
    secretKey?: string  
}): Promise<string> => {
    return CryptoJS.AES.decrypt(ciphertext, secretKey).toString(CryptoJS.enc.Utf8);
};