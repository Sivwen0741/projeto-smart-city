import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('perfil')
export class Perfil {
  @PrimaryGeneratedColumn('identity', { type: 'bigint', generatedIdentity: 'ALWAYS' })
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'varchar', nullable: true })
  descricao: string | null;
}
