export interface GooglePayload {
  email_verified: boolean;
  given_name: string;
  family_name: string;
  email: string;
  picture?: string;
}