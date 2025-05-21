export interface User {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  contactNumber: string;
  dob: string;
  email: string;
  password: string;
  [key: string]: any; // For any additional properties
}