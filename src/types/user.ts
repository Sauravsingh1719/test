export type Student = {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  role: 'student';
};

export type Teacher = {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  role: 'teacher';
};