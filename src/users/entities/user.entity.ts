export enum Role {
  AdminOfSite = 'AdminOfSite',
  User = 'User',
  Seller = 'Seller',
}
export class UserEntity {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string | null;
  addresses: Array<string>;
  email: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  resetPassToken: string | null;
  dateOfToken: Date | null;
}
