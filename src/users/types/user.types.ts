type Users = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string | null;
  roles: string[];
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
};
export { Users };
