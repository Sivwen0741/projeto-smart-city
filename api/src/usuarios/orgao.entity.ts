import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orgao')
export class Orgao {
  @PrimaryGeneratedColumn('identity', { type: 'bigint', generatedIdentity: 'ALWAYS' })
  id: string;

  @Column()
  nome: string;

  @Column()
  sigla: string;

  @Column({ name: 'email_contato', type: 'varchar', nullable: true })
  emailContato: string | null;
}
