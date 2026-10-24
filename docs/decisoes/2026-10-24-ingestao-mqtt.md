# Ingestão de leituras pelo MQTT, motor de alertas e simulador

- **Data:** 24/10/2026
- **Item:** TT02, critérios 1 a 8 (`docs/sprint-5-criterios.md`)
- **Situação:** aceita

## Contexto

A TT02 liga os dispositivos à plataforma: as leituras chegam pelo Mosquitto, a última
comunicação passa a ser real e as regras da US23 começam a gerar alertas. O Documento de Visão
(seção 7.2) prevê o recebimento pelo broker MQTT e um simulador próprio para as variáveis sem
fonte pública. Era preciso definir o formato das mensagens, como a duração mínima da regra é
contada e o que mantém os dispositivos de exemplo vivos depois que a renovação artificial da
carga inicial sai (`2026-10-22-dados-de-demonstracao.md`).

## Alternativas consideradas

1. **Um tópico por grandeza** (`.../{código}/{grandeza}` com o valor puro). É simples de
   publicar, mas a estação ambiental mandaria várias mensagens por ciclo, e o sinal de vida de
   câmeras e semáforos precisaria de um tópico à parte.
2. **Um tópico por dispositivo, com mensagem JSON que leva a lista de leituras** (escolhida).
3. **Contar a duração mínima pelo relógio do servidor.** Leituras atrasadas ou reenviadas
   distorceriam a contagem. A escolha foi contar pelo horário da medição.

## Decisão

**Tópico e mensagem.** Cada dispositivo publica em `scoc/dispositivos/{código}/leituras`, com
QoS 1:

```json
{ "dataHora": "2026-10-24T14:33:00Z", "leituras": [{ "grandeza": "nivel_agua", "valor": 3.81, "unidade": "m" }] }
```

- `dataHora` é opcional; sem ela vale o horário do recebimento. `unidade` também é opcional;
  sem ela vale a unidade padrão da grandeza (`api/src/grandezas.ts`).
- Uma lista vazia, ou a mensagem `{}`, é sinal de vida: atualiza a última comunicação sem gravar
  leitura. É o que câmeras e semáforos mandam.
- As grandezas aceitas são as que o tipo mede: a do sensor urbano, as variáveis da estação
  ambiental e, desde o DT01, pontos apagados e consumo de energia do controlador de iluminação.
- A mensagem é aceita ou recusada inteira. Dispositivo não cadastrado ou inativo, grandeza que o
  tipo não mede, valor não numérico, data inválida ou conteúdo que não é JSON geram um aviso
  `mensagem descartada de {código}: {motivo}` no log da interface de programação.
- O broker continua sem autenticação, acessível só pela rede do compose e pelo `localhost`
  (TT01).

**Motor de alertas.**

- Cada leitura gravada de dispositivo `ativo` é comparada com as regras ativas da mesma grandeza.
  Em manutenção, a leitura é gravada e não gera alerta.
- A duração mínima conta da primeira leitura da sequência ininterrupta fora do limite até a
  leitura atual, pelo horário da medição. Uma leitura dentro do limite reinicia a contagem, e a
  duração zero dispara na primeira leitura.
- As mensagens são processadas uma de cada vez, na ordem de chegada, porque a contagem depende
  da ordem.
- Um alerta ativo (`aberto` ou `em_atendimento`) por regra e dispositivo, garantido também por
  índice único parcial (`alerta_ativo_uq`). Enquanto ele existir, novas leituras fora do limite
  não abrem outro.
- O alerta copia operador, limite e gravidade da regra no disparo (US23-4).
- O encerramento automático dos alertas não graves quando a leitura normaliza é da US28.

**Simulador.** O serviço `simulador` do compose publica, a cada 30 s, pelos dispositivos de
exemplo:

| Dispositivo | O que publica | Episódio que cruza uma regra de exemplo |
|---|---|---|
| SN-014 | nível do Arroio Olarias | cheia de 15 min a cada 40 min, a partir do minuto 3 da subida: alerta grave depois de 10 min |
| EA-02 | precipitação e temperatura | chuva forte de 3 min no início de cada cheia: alerta grave imediato |
| EA-03 | PM2.5 e PM10 | 70 min de poluição a cada 3 h, a partir do minuto 20: alerta de atenção depois de 60 min |
| SN-042 | nível sonoro | 20 min acima de 70 dB a cada hora, a partir do minuto 30: alerta de atenção depois de 15 min |
| SN-031 | velocidade média | 25 min de trânsito lento a cada 2 h, a partir do minuto 60: alerta de atenção depois de 20 min |
| IL-118 | pontos apagados e consumo | 9 pontos apagados; está em manutenção, então não gera alerta |
| CAM-22, CAM-08, SF-105, SF-061 | sinal de vida | — |

EA-07 e SN-027 não publicam, para continuarem como os exemplos "sem comunicação" do protótipo.
SN-019 está inativo.

## Consequências

- A renovação artificial da última comunicação saiu da carga inicial. O teste da US22-6 que a
  verificava passou a verificar o contrário: a subida não altera a última comunicação.
- As leituras do simulador são gravadas com origem `mqtt`, como as de um dispositivo real. Elas
  são distinguíveis apenas pelo dispositivo, porque só os exemplos são simulados.
- Os códigos dos exemplos continuam reservados: um dispositivo real cadastrado como SN-014
  receberia as leituras do simulador.
- Com o compose parado, as leituras param e os dispositivos passam a sem comunicação, que é o
  comportamento correto.
- A regra de exemplo "Falha na iluminação pública" (pontos apagados > 0 por 5 min, informativo)
  foi acrescentada à carga inicial.
- Os testes e2e usam um broker próprio (`mosquitto-teste`, perfil `teste`).
