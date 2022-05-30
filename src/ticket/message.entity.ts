import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import {Ticket} from '@/ticket/ticket.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column()
  @Index()
  ticketId: number;

  @Column({type: 'varchar'})
  senderId: string;

  @Column({type: 'varchar'})
  senderName: string;

  @ManyToOne(() => Ticket, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  ticket: Ticket;

  @Column({type: 'varchar'})
  message: string;

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date;
}
