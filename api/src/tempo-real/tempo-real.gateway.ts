import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Server } from 'socket.io';
import { EventosAlertasService } from '../alertas/eventos-alertas.service';
import { AuthService } from '../auth/auth.service';
import { OcorrenciasService } from '../ocorrencias/ocorrencias.service';

export const CAMINHO_TEMPO_REAL = '/api/tempo-real';

// o caminho fica sob /api para passar pelo mesmo proxy da interface web
@WebSocketGateway({ path: CAMINHO_TEMPO_REAL })
export class TempoRealGateway implements OnGatewayInit, OnModuleDestroy {
  private readonly logger = new Logger(TempoRealGateway.name);
  private assinaturas: Subscription[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly eventos: EventosAlertasService,
    private readonly ocorrencias: OcorrenciasService,
  ) {}

  afterInit(servidor: Server): void {
    servidor.use(async (socket, seguir) => {
      const token = socket.handshake.auth?.token;
      const usuario = typeof token === 'string' ? await this.auth.usuarioDoToken(token) : null;
      if (!usuario) return seguir(new Error('Sessão inválida ou expirada. Entre novamente.'));
      socket.data.usuarioId = usuario.id;
      seguir();
    });
    this.assinaturas = [
      this.eventos.eventos.subscribe(({ evento, alerta }) => servidor.emit(evento, alerta)),
      this.ocorrencias.novas.subscribe((ocorrencia) => servidor.emit('ocorrencia:nova', ocorrencia)),
      this.ocorrencias.atualizadas.subscribe((ocorrencia) => servidor.emit('ocorrencia:atualizada', ocorrencia)),
    ];
    this.logger.log(`tempo real em ${CAMINHO_TEMPO_REAL}`);
  }

  onModuleDestroy(): void {
    this.assinaturas.forEach((a) => a.unsubscribe());
  }
}
