export type SessionUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  accessToken: string;
  user: SessionUser;
};

export type AuthGateway = {
  currentSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
};
