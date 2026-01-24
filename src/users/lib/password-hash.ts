import * as argon2 from 'argon2';

export type PasswordHash = string;

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
};

export async function hashPassword(
  plainPassword: string
): Promise<PasswordHash> {
  return argon2.hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hash: PasswordHash,
  plainPassword: string
): Promise<boolean> {
  return argon2.verify(hash, plainPassword);
}
