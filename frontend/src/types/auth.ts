import { User } from "./user";

export interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface InstructorSettingsForm {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  title: string;
  website: string;
  avatar: File | null;
  avatarPreview: string;
}
