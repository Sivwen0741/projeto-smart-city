# Alerta grave visível até ser reconhecido

- **Data:** 24/10/2026
- **Item:** US28, critérios 1 a 4 (`docs/sprint-5-criterios.md`)
- **Situação:** aceita; a faixa foi desenhada fora do protótipo e aprovada pelo usuário em
  24/10/2026, junto com as telas da US04 e da US05

## Contexto

A US28 nasceu da troca de plantão: um alerta grave não reconhecido não pode sumir da fila entre
dois operadores. Para isso fazer sentido, os demais alertas precisam poder sair sozinhos. Antes
desta história, nenhum alerta saía da lista sem ação no banco.

## Alternativas consideradas

1. **Nenhum alerta se encerra sozinho.** A US28 se resumiria a uma faixa e à ordem da lista, e a
   fila cresceria com alertas de condições que já passaram.
2. **Atenção e informativo sem reconhecimento se encerram quando a leitura normaliza; o grave
   nunca** (escolhida, aprovada nos critérios).

## Decisão

- O motor encerra (`situacao = 'encerrado'`, com `data_encerramento`) o alerta aberto, não grave,
  da regra e do dispositivo, quando chega uma leitura fora da condição. A condição usada é a
  copiada no alerta (operador e limite do disparo), e não a da regra atual, para a edição da regra
  não mudar o destino de um alerta já emitido.
- Alerta reconhecido (`em_atendimento`) não se encerra pela normalização. Encerrar o atendimento é
  da US06.
- Cada encerramento é avisado às telas pelo `alerta:atualizado` da US03.
- A faixa fica abaixo do menu, em todas as telas autenticadas, sem botão de fechar. Mostra a
  quantidade de graves sem reconhecimento e o mais antigo, com "Ver alerta". O estado vem de
  `GET /api/alertas/resumo` (`gravesSemReconhecimento` e `graveMaisAntigo`), então sobrevive a
  recarga, saída e entrada de outro usuário.
- Na lista e na fila do painel, o grave sem reconhecimento fica acima de todos, inclusive de um
  grave mais recente já em atendimento, com a marca "fixo até reconhecer".

## Consequências

- "Ver alerta" leva à tela de alertas. A abertura do painel de reconhecimento desse alerta vem com
  a US04.
- Os filtros de período (US08) ainda não existem. Quando vierem, o grave sem reconhecimento não
  pode ficar de fora por eles.
