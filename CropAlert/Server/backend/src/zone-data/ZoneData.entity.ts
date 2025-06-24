import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class ZoneData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float', { nullable: true })
  latitude?: number;

  @Column('float', { nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  status?: string;

  @ManyToOne(() => User, (user) => user.zones, { onDelete: 'CASCADE' })
  user: User;
}

