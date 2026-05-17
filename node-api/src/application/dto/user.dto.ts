export interface CreateUserInput {
  fullName: string;
  email: string;
}

export interface UserOutput {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
