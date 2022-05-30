import {Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {TicketStatus} from '@/ticket/ticket-status';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({type: 'varchar'})
  category: string;

  @Column({type: 'varchar', nullable: true})
  categoryName?: string;

  @Column({type: 'varchar'})
  userId: string;

  @Column({type: 'varchar'})
  status: TicketStatus;

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date;
}
