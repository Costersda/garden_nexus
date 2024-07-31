export interface Comment {
  _id?: string;
  id?: string;
  user: {
    _id: string;
    username: string;
    imageFile?: string; // assuming the user might have a profile picture
  };
  blogId?: string;
  forumId?: string;
  comment: string;
  createdAt: Date;
  isEdited?: boolean;
  showDropdown?: boolean;
  replyingTo?: {
    id: string;
    user: {
      _id: string;
      username: string;
    };
    comment: string;
  } | null;
  replyText: string;
}