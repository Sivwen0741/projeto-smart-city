# Alerta de dispositivo sem comunicação

- **Data:** 25/10/2026
- **Item:** US07, critérios 1 a 4 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

A US07 pede um alerta "sem comunicação", de gravidade atenção, para o dispositivo ativo que passa
do limite de comunicação da US22. No DER, todo alerta pertence a uma regra (`alerta.regra_alerta_id`
obrigatório), e as regras da US23 comparam uma grandeza com um limite fixo, válido para a cidade
toda. O limite de comunicação, porém, é de cada dispositivo.

## Alternativas consideradas

1. **Tornar `alerta.regra_alerta_id` opcional e marcar o tipo do alerta.** Quebra a relação do DER e
   obriga todas as consultas de alerta a tratar a regra ausente.
2. **Uma regra comum na tela de regras.** O operador poderia mudar o limite ou a grandeza de uma
   regra que não usa nenhum dos dois.
3. **Uma regra de sistema, criada por migração e escondida da tela de regras** (escolhida). O alerta
   continua ligado a uma regra, e o índice único de alerta ativo por regra e dispositivo (TT02-6) já
   garante a US07-2.

## Decisão

- Coluna nova `regra_alerta.sistema` e a regra "Dispositivo sem comunicação" (grandeza
  `sem_comunicacao`, atenção), criadas na migração `AlertaSemComunicacao`. A tela e as rotas de regras
  não listam nem editam regra de sistema.
- Rotina na interface de programação a cada 60 s (`VERIFICACAO_COMUNICACAO_SEGUNDOS`, zero desliga),
  sem biblioteca nova. Ela usa a mesma situação calculada da US22, então dispositivo em manutenção ou
  inativo não entra.
- O valor do alerta é o tempo sem comunicação e o limite é o da US22, os dois em minutos. Quem nunca
  comunicou conta desde a data de instalação.
- A ingestão encerra o alerta ainda aberto quando chega qualquer mensagem do dispositivo, inclusive
  o sinal de vida. Alerta reconhecido segue em atendimento até a ocorrência ser encerrada.
- Esse alerta não muda a cor do dispositivo no mapa nem na lista: ele já aparece como "sem
  comunicação".

## Consequências

- O DER ganha `regra_alerta.sistema`; entra na regeneração do diagrama no fechamento da Sprint 6.
- No ambiente de demonstração, EA-07 e SN-027, que não publicam de propósito, geram o alerta no
  primeiro minuto depois da subida.
