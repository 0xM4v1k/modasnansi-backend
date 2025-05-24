// src/files/entities/file.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@users/entities/user.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ name: 'filename' })
  filename: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ nullable: true })
  size: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updater_id' })
  updater: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleter_id' })
  deleter: User;

  @CreateDateColumn()
  date_created: Date;

  @UpdateDateColumn()
  date_updated: Date;

  @Column({ nullable: true })
  date_deleted: Date;

  @Column({ default: false })
  is_deleted: boolean;
}
