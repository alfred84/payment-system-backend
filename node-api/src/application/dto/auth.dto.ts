export interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface RefreshAccessTokenInput {
  refreshToken: string;
}

export interface LogoutInput {
  refreshToken: string;
}

export interface AuthTokensOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
