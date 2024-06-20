export interface User {
    _id: string;
    email: string;
    username: string;
    country?: string;
    bio?: string;
    imageFile?: string; // This will be the base64 string of the image
  }
  