export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  must_change_password: boolean;
}
