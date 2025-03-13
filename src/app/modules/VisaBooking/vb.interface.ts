export interface IDocument {
	file: string; 
	cloudinary_id: string;
  }
 
  export interface ISubTraveler {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	email: string;
	localAddress: string;
	specialNotes: string;
	visaType: string;
	passport_img?: IDocument;
	photo_img?: IDocument;
	bankStatement_pdf?: IDocument;
	bankSolvencyCertificate?: IDocument;
	visitingCard?: IDocument;
	hotelBooking?: IDocument;
	airTicket?: IDocument;
	jobDocument?: IDocument[];
	studentDocument?: IDocument[];
	businessPersonDocument?: IDocument[];
	otherDocument?: IDocument[];
  }
 
  export interface ITraveler {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	email: string;
	localAddress: string;
	specialNotes: string;
	visaType: string;
	passport_img?: IDocument;
	photo_img?: IDocument;
	bankStatement_pdf?: IDocument;
	bankSolvencyCertificate?: IDocument;
	visitingCard?: IDocument;
	hotelBooking?: IDocument;
	airTicket?: IDocument;
	jobDocument?: IDocument[];
	studentDocument?: IDocument[];
	businessPersonDocument?: IDocument[];
	otherDocument?: IDocument[];
 
	Travelers: ISubTraveler[];
  }
 