import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LogAtividade } from './log-atividade.entity';

export interface RegistroAtividade {
  usuarioId: string | null;
  acao: string;
  entidadeAfetada?: string;
  entidadeId?: string;
  detalhes?: Record<string, unknown>;
  enderecoIp?: string | null;
}

@Injectable()
export class LogAtividadeService {
  constructor(@InjectRepository(LogAtividade) private readonly logs: Repository<LogAtividade>) {}

  async registrar(registro: RegistroAtividade, manager?: EntityManager): Promise<void> {
    const repositorio = manager ? manager.getRepository(LogAtividade) : this.logs;
    await repositorio.save(
      repositorio.create({
        usuario: registro.usuarioId ? { id: registro.usuarioId } : null,
        acao: registro.acao,
        entidadeAfetada: registro.entidadeAfetada ?? null,
        entidadeId: registro.entidadeId ?? null,
        detalhes: registro.detalhes ?? null,
        enderecoIp: registro.enderecoIp ?? null,
      }),
    );
  }
}
