import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'clicks', schema: 'app' })
export class Click {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url_id: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  ip_address: string;

  @CreateDateColumn()
  clicked_at: Date;
}
