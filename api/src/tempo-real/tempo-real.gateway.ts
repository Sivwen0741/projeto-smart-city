import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Server } from 'socket.io';
import { EventosAlertasService } from '../alertas/eventos-alertas.service';
import { AuthService } from '../auth/auth.service';

export const CAMINHO_TEMPO_REAL = '/api/tempo-real';

// o caminho fica sob /api para passar pelo mesmo proxy da interface web
@WebSocketGateway({ path: CAMINHO_TEMPO_REAL })
export class TempoRealGateway implements OnGatewayInit, OnModuleDestroy {
  private readonly logger = new Logger(TempoRealGateway.name);
  private assinatura?: Subscription;

  constructor(
    private readonly auth: AuthService,
    private readonly eventos: EventosAlertasService,
  ) {}

  afterInit(servidor: Server): void {
    servidor.use(async (socket, seguir) => {
      const token = socket.handshake.auth?.token;
      const usuario = typeof token === 'string' ? await this.auth.usuarioDoToken(token) : null;
      if (!usuario) return seguir(new Error('Sessão inválida ou expirada. Entre novamente.'));
      socket.data.usuarioId = usuario.id;
      seguir();
    });
    this.assinatura = this.eventos.eventos.subscribe(({ evento, alerta }) => servidor.emit(evento, alerta));
    this.logger.log(`tempo real em ${CAMINHO_TEMPO_REAL}`);
  }

  onModuleDestroy(): void {
    this.assinatura?.unsubscribe();
  }
}
