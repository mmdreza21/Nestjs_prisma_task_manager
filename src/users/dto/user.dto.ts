import { ObjectId } from 'bson';
import { Expose } from 'class-transformer';

export class UserDTO {
  @Expose()
  id: string | ObjectId;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phone?: string;
  @Expose()
  addresses?: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}
