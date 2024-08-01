export interface Blog {
    _id?: string;
    user_id: string;
    title: string;
    content_section_1: string;
    content_section_2?: string;
    content_section_3?: string;
    image_1: string;
    image_2?: string;
    image_3?: string;
    categories: string[];
    comments: any[];
    isEdited?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  