import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'urls', schema: 'app' })
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  original_url: string;

  @Column({ unique: true, length: 6 })
  short_code: string;

  @Column({ nullable: true })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
