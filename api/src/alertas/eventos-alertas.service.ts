import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { AlertasService } from './alertas.service';
import { AlertaDto } from './dto/alerta.dto';

export interface EventoAlerta {
  evento: 'alerta:novo' | 'alerta:atualizado';
  alerta: AlertaDto;
}

// chamado depois do commit, para a tela nunca receber um alerta que a consulta ainda não enxerga
@Injectable()
export class EventosAlertasService {
  readonly eventos = new Subject<EventoAlerta>();

  constructor(private readonly alertas: AlertasService) {}

  async novos(ids: string[]): Promise<void> {
    for (const id of ids) await this.publicar('alerta:novo', id);
  }

  async atualizado(id: string): Promise<void> {
    await this.publicar('alerta:atualizado', id);
  }

  private async publicar(evento: EventoAlerta['evento'], id: string): Promise<void> {
    const alerta = await this.alertas.buscar(id);
    if (alerta) this.eventos.next({ evento, alerta });
  }
}
