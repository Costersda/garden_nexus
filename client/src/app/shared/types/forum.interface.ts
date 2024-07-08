export interface Forum {
    _id?: string;
    user_id: string;
    title: string;
    content: string;
    categories: string[];
    comments: any[];
    isEdited?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }