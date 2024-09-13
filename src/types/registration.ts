export type Registration = {
    id: string;
    registrationType: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    company: string;
    designation: string;
    city: string;
    status: string;
    paymentStatus: string;
    lastFourDigits: string | null;
    imageUrl: string | null;
    qrCodeUrl: string | null;
    ticketType: string | null;
    createdAt: Date;
    updatedAt: Date;
    comments?: Comment[];
  };
  
  export type Comment = {
    id: string;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    registrationId: string;
    authorId: string;
    authorName: string;
  };