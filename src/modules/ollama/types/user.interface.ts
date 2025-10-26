// User interface for request object
// Adjust this based on your actual authentication implementation
export interface AuthenticatedUser {
  id: string;
  sub?: string;
  email?: string;
  tenantId?: string;
  roles?: string[];
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}