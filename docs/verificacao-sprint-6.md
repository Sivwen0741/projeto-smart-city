# Verificação dos critérios de aceite da Sprint 6

Relação entre os critérios de [`sprint-6-criterios.md`](sprint-6-criterios.md) e a forma como cada
um foi verificado. Este documento cresce a cada item mesclado na `main`.

- **Testes automatizados:** casos e2e em `api/test/`, com o número do critério no nome. Para
  rodar, veja a seção "Testes automatizados" do [README](../README.md).
- **Verificação manual:** feita pelo autor do código, nos critérios que dependem da tela ou do
  ambiente completo.
- **Revisão:** como nas sprints anteriores, sem revisão de outro integrante. A pendência segue no
  DT06 ([`verificacao-sprint-4.md`](verificacao-sprint-4.md)).

## TT02-9 - Dados do simulador identificados

Mesclada em 25/10/2026. Suíte completa: 125 testes passando num banco de teste recriado. Decisão
em [`2026-10-25-dados-do-simulador.md`](decisoes/2026-10-25-dados-do-simulador.md).

| Critério | Teste automatizado (`tt02.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **TT02-9** | a leitura do simulador é gravada com origem simulador e o dispositivo e o alerta aparecem como simulados | 25/10/2026, ambiente de desenvolvimento com o simulador: 9 dos 13 dispositivos com a marca "simulado" na lista (os 4 sem marca, EA-07, SN-014, SN-019 e SN-027, estão inativos ou sem comunicação) e na chamada do mapa (CAM-08). Uma leitura de chuva de 72 mm publicada com origem `simulador` em EA-02 gerou o alerta grave com a marca na tela de alertas e na fila do painel. A marca na tela não tem teste automatizado (DT05). | Verificado, tela manual |

## US06 - Atualizar a situação de uma ocorrência até a resolução

Branch `sprint-6-us06`, PR aberto para revisão. Suíte completa: 139 testes passando num banco de
teste recriado. Decisões de tela em
[`2026-10-25-prancheta-sprint-6.md`](decisoes/2026-10-25-prancheta-sprint-6.md).

| Critério | Teste automatizado (`us06.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US06-1** | cada ocorrência tem protocolo, gravidade, categoria, bairro, órgão, situação e abertura<br>em andamento, abertas vêm antes das em atendimento; depois a mais grave e a mais antiga<br>visão inválida é recusada | 25/10/2026, ambiente de desenvolvimento: aba "Ocorrências" com as duas visões e o tempo em aberto. | Verificado |
| **US06-2** | o histórico junta a geração e o reconhecimento do alerta com os registros do atendimento<br>ocorrência inexistente responde 404 | Detalhe conferido contra `04-ocorrencia.svg`. | Verificado |
| **US06-3** | a primeira providência de uma ocorrência aberta passa para em atendimento<br>providência em atendimento mantém a situação e também entra no histórico<br>providência vazia ou situação inválida é recusada | Na tela, a providência passou 2026-10-0001 para em atendimento e entrou no histórico com autor e hora. | Verificado |
| **US06-4** | sem observação o encerramento é recusado<br>encerrar grava a data e encerra só os alertas vinculados em atendimento<br>ocorrência encerrada não aceita outra atualização | Na tela, "Encerrar ocorrência" com a caixa vazia mostrou "Escreva a observação de encerramento.". | Verificado |
| **US06-5** | a encerrada sai da lista em andamento e do mapa, e continua consultável | O mapa usa a mesma lista em andamento. | Verificado |
| **US06-6** | providência e encerramento geram registros no log de atividades<br>a atualização e o alerta encerrado chegam às outras telas | Contador da aba passou de 1 para 0 sem recarregar a página. | Verificado |

O botão "Abrir" da tela de alertas e da fila do painel, antes marcado como previsto para a US06,
abre a ocorrência vinculada ou, sem vínculo, o registro da US05 com o alerta.

## US07 - Aviso quando um dispositivo parar de enviar dados

Branch `sprint-6-us07`, sobre a da US06, PR aberto para revisão. Suíte completa: 149 testes passando
num banco de teste recriado. Decisão em
[`2026-10-25-alerta-sem-comunicacao.md`](decisoes/2026-10-25-alerta-sem-comunicacao.md).

| Critério | Teste automatizado (`us07.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US07-1** | a rotina é agendada a cada 60 s quando nada é configurado<br>dispositivo ativo além do limite da US22 recebe o alerta, com o tempo e o limite em minutos<br>dispositivo que nunca se comunicou recebe o alerta sem valor, e não uma contagem desde a instalação<br>dispositivo dentro do limite não recebe alerta<br>a regra de sistema aparece na tela de regras, marcada, e não pode ser editada nem desativada<br>o alerta não muda a cor do dispositivo, que continua sem comunicação | 25/10/2026, ambiente de desenvolvimento: um minuto depois da subida, a rotina emitiu o alerta para EA-07 e SN-027, que não publicam de propósito; a tela de alertas e a fila do painel mostram "23 h 15 min, limite 1 min" para EA-07 e "nunca se comunicou" para SN-027. A tela de regras mostra a regra do sistema apagada e marcada. | Verificado |
| **US07-2** | há no máximo um alerta de sem comunicação ativo por dispositivo | Também garantido pelo índice único `alerta_ativo_uq`. | Verificado |
| **US07-3** | o sinal de vida encerra o alerta aberto<br>alerta já reconhecido continua em atendimento | — | Verificado |
| **US07-4** | dispositivo em manutenção ou inativo não gera o alerta | — | Verificado |
