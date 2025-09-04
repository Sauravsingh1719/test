export type Student = {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  role: 'student';
  category: string | { _id: string; name: string } | null;
};

export type Teacher = {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  role: 'teacher';
  category: string | { _id: string; name: string } | null;
};
