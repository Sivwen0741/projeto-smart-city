import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Orgao } from './orgao.entity';
import { Perfil } from './perfil.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('identity', { type: 'bigint', generatedIdentity: 'ALWAYS' })
  id: string;

  @ManyToOne(() => Orgao, { eager: true, nullable: false })
  @JoinColumn({ name: 'orgao_id' })
  orgao: Orgao;

  @ManyToOne(() => Perfil, { eager: true, nullable: false })
  @JoinColumn({ name: 'perfil_id' })
  perfil: Perfil;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column({ name: 'senha_hash', select: false })
  senhaHash: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ name: 'ultimo_acesso', type: 'timestamptz', nullable: true })
  ultimoAcesso: Date | null;
}
