export interface User {
  _id: string;
  id: string;
  email: string;
  username: string;
  country?: string;
  bio?: string;
  imageFile?: string;
  isVerified: boolean;
  following: string[];
  followers: string[];
}