export interface User {
  id : number;
  nickname : string;
  email : string;
  role : Role;
}

export enum Role {ADMIN = "admin", USER = "user"}
