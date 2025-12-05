export interface TokenEntity {
    access_token: string;
    refresh_token: string;
}

export interface TokenSignature {
    access_signature: string,
    refresh_signature: string
}