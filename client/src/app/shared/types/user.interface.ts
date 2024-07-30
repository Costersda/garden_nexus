export interface User {
  _id: string;
  id: string; // add ? to "id?" if anything broke
  email: string;
  username: string;
  country?: string;
  bio?: string;
  imageFile?: string; // This will be the base64 string of the image
  isVerified: boolean;
  following: string[]; // Array of user IDs that this user is following
  followers: string[]; // Array of user IDs that this user is following
}