# Alertas em tempo real pelo Socket.IO

- **Data:** 24/10/2026
- **Item:** US03, critérios 1 a 4 (`docs/sprint-5-criterios.md`)
- **Situação:** aceita

## Contexto

Até a US02, as telas consultavam a interface de programação a cada 15 s. A US03 pede que um
alerta novo apareça em até 2 s, que mudanças feitas por outro operador também apareçam, que a
conexão exija o token e que nada se perca numa queda. O Socket.IO é a tecnologia decidida para
tempo real.

## Alternativas consideradas

1. **Mandar no evento só o identificador e deixar a tela buscar o alerta.** É uma consulta a mais
   por evento, sem ganho.
2. **Mandar o alerta completo no evento e aplicar a mudança na tela.** Cada tela teria de saber
   reordenar e recontar, e uma queda deixaria a tela desatualizada sem que ela soubesse.
3. **Mandar o alerta completo, mas a tela só usar o evento como aviso para consultar de novo;
   cada (re)conexão também dispara a consulta** (escolhida). A lista, os indicadores e o mapa
   continuam vindo das mesmas rotas, e a reconexão recupera o que foi emitido no intervalo.

## Decisão

- Caminho `/api/tempo-real`, para passar pelo mesmo proxy do nginx, que agora repassa o
  WebSocket.
- O token vai no `auth` do handshake. Sem token, com token inválido ou de usuário inativo, a
  conexão é recusada com "Sessão inválida ou expirada. Entre novamente.".
- Eventos `alerta:novo` (emitido pela ingestão depois do commit) e `alerta:atualizado` (para
  reconhecimento e encerramento, das US04 e US28), com o alerta no formato de `GET /api/alertas`.
- Na tela: contador do menu, tela de alertas, fila do painel e mapa consultam de novo ao receber
  um evento e a cada reconexão. A consulta a cada 15 s continua, como reserva.

## Consequências

- A conexão aberta não é revalidada quando o token vence. A tela sai sozinha no vencimento
  (US20-4) e, com isso, fecha a conexão.
- Ocorrências novas (US05) vão usar o mesmo canal.
