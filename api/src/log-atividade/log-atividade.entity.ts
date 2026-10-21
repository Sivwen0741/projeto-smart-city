import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('log_atividade')
export class LogAtividade {
  @PrimaryGeneratedColumn('identity', { type: 'bigint', generatedIdentity: 'ALWAYS' })
  id: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column()
  acao: string;

  @Column({ name: 'entidade_afetada', type: 'varchar', nullable: true })
  entidadeAfetada: string | null;

  @Column({ name: 'entidade_id', type: 'bigint', nullable: true })
  entidadeId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  detalhes: Record<string, unknown> | null;

  @Column({ name: 'endereco_ip', type: 'varchar', nullable: true })
  enderecoIp: string | null;

  @Column({ name: 'data_hora', type: 'timestamptz', default: () => 'now()' })
  dataHora: Date;
}
