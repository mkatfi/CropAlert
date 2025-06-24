
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ZoneData } from 'src/zone-data/ZoneData.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['farmer', 'agronomist'] })
  role: 'farmer' | 'agronomist';


  @OneToMany(() => ZoneData, (zone) => zone.user)
  zones: ZoneData[];
}

