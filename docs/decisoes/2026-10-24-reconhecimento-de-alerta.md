# Reconhecimento do alerta com providência

- **Data:** 24/10/2026
- **Item:** US04, critérios 1 a 4 (`docs/sprint-5-criterios.md`); completa a US03-2
- **Situação:** aceita; o painel foi desenhado fora do protótipo e aprovado pelo usuário em
  24/10/2026

## Contexto

O protótipo mostra o botão "Reconhecer" na tela de alertas e no painel, mas não a tela do
reconhecimento. A história pede a providência adotada e quer evitar acionamento duplicado, o
que, com vários operadores no plantão, significa um só reconhecimento por alerta.

## Alternativas consideradas

1. **Ler o alerta, conferir a situação e gravar.** Dois operadores podem ler "aberto" ao mesmo
   tempo e os dois gravariam.
2. **Bloquear a linha (`SELECT ... FOR UPDATE`).** Funciona, mas o `UPDATE` condicional resolve
   com uma instrução só.
3. **`UPDATE ... WHERE situacao = 'aberto'`: quem atualiza a linha reconhece, os demais recebem
   409** (escolhida).

## Decisão

- `POST /api/alertas/{id}/reconhecimento` com `{ "providencia": "..." }`. A providência é
  obrigatória, sem espaços nas pontas, com até 2000 caracteres.
- O reconhecimento grava usuário, data e hora e providência, passa o alerta a `em_atendimento`,
  registra `reconhecimento_alerta` no log de atividades e avisa as telas (`alerta:atualizado`).
- A tentativa sobre um alerta já reconhecido ou encerrado recebe 409, com a mensagem de quem
  reconheceu e quando, e o alerta como está no corpo, para a tela mostrar a providência que valeu.
- Painel lateral na tela de alertas, aberto por "Reconhecer", "Detalhes", pela linha, pela faixa
  da US28 e pela fila do painel (`/alertas?alerta=id`). Alerta já reconhecido abre no estado
  "Alerta reconhecido".
- Se outro operador reconhecer enquanto este escreve, o tempo real atualiza o painel e, havendo
  texto digitado, avisa que a providência não foi gravada.
- A hora da mensagem de recusa é a de Brasília (`America/Sao_Paulo`).

## Consequências

- "Abrir ocorrência com este alerta" aparece desabilitado com "sprint 5" até a US05.
- "Abrir", nos alertas em atendimento, continua desabilitado: abrir a ocorrência é da US06.
- No rodapé, o botão principal fica à direita, como nos painéis de dispositivo e de regra, e não à
  esquerda como na prancheta.
