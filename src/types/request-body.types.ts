export type UpdateUserBody = {
  firstName: string;
  lastName: string;
};

export type CreateKennelBody = {
  name: string;
  description: string;
  breeds: string[];
  location: string;
  deleteBanner?: boolean;
  email?: string;
  mobileNumber?: string;
};

export type UpdateKennelBody = CreateKennelBody;

export interface CreateStudBody {
  name: string;
  breed: string;
  studFee: number;
  location: string;
  description: string;
}

export interface UpdateStudBody extends CreateStudBody {
  deleteImages?: string[];
}

export interface CreateForSaleBody {
  breed: string;
  sex: string;
  dateOfBirth: string;
  price: number;
  location: string;
  description: string;
}

export interface UpdateForSaleBody extends CreateForSaleBody {
  deleteImages?: string[];
}

export interface CreateConversationBody {
  receiverId: string;
}

export interface CreateMessageBody {
  senderId: string;
  receiverId: string;
  messageBody: string;
}
export interface CreateMessageByConversationIdBody {
  senderId: string;
  senderType: "User" | "Kennel";
  messageBody: string;
}
