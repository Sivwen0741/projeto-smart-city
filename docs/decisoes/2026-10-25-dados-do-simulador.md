# Identificação dos dados do simulador

- **Data:** 25/10/2026
- **Item:** TT02-9 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

Desde a TT02, o serviço `simulador` publica no Mosquitto em nome dos dispositivos de exemplo, e a
ingestão gravava tudo com origem `mqtt`. O Documento de Visão (seção 9.2) pede que as variáveis
do simulador sejam "identificadas como tais na interface". Sem isso, um operador não distingue um
sensor instalado de um dado de demonstração.

## Alternativas consideradas

1. **Um tópico MQTT próprio para o simulador.** Duplicaria a assinatura e o tratamento, e o
   dispositivo continuaria o mesmo.
2. **Marcar o dispositivo no cadastro como simulado.** Um mesmo dispositivo pode receber dado real
   depois; a marca ficaria desatualizada.
3. **O simulador declara `origem: "simulador"` na mensagem, e a origem vai para a leitura e para
   o dispositivo** (escolhida). A mensagem sem o campo continua valendo como `mqtt`; qualquer
   outro valor é descartado com registro no log, como as demais mensagens inválidas.

## Decisão

- `leitura.origem` aceita `mqtt`, `simulador` e `open-meteo` (este para a US09).
- Coluna nova `dispositivo.origem_comunicacao` (`mqtt` ou `simulador`), atualizada junto com a
  `ultima_comunicacao`. Câmera e semáforo só mandam sinal de vida, sem leitura, e por isso a
  marca do dispositivo não pode depender da leitura.
- A interface de programação devolve `simulado` em dispositivos e em alertas (o do alerta vem da
  leitura que o disparou) e a `origem` na última leitura.
- Na tela, a marca "simulado" aparece ao lado do código na lista de dispositivos, do nome na
  chamada do mapa, do dispositivo na tela de alertas e no painel de reconhecimento, e do local na
  fila do painel. Segue o padrão da marca "fixo até reconhecer" (texto pequeno com um quadrado),
  em tinta média e quadrado tracejado, para não ser confundida com gravidade.

## Consequências

- O DER ganha `dispositivo.origem_comunicacao`; entra na regeneração do diagrama no fechamento da
  Sprint 6.
- A faixa de alerta grave (US28) não leva a marca: o fundo vermelho não comporta o tom neutro, e o
  "Ver alerta" leva à tela de alertas, onde a marca aparece.
