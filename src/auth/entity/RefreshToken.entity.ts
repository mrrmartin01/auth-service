import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  /** Enforces one row per user */
  @PrimaryColumn('uuid')
  userId: string;

  @Column()
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
