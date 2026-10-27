# Gráfico histórico

- **Data:** 27/10/2026
- **Item:** US19, critérios 1 a 4 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

A prancheta da Sprint 6 (`2026-10-25-prancheta-sprint-6.md`) aprovou o histórico em tela própria,
`/dispositivos/:id/historico`: 24 h com média por 5 min; 7 e 30 dias com média por hora e a faixa
entre mínimo e máximo; uma linha tracejada por regra ativa. Em `05-dispositivos.svg`, o painel do
dispositivo tem o botão "Ver histórico", e a tabela tem as colunas "Última leitura" e "Últimas 3 h",
esta com uma barrinha de nove colunas cinzas.

## Alternativas consideradas

1. **Mandar as leituras brutas e agregar no navegador.** Em 30 dias, um sensor a cada 30 s passa de
   86 mil leituras; contraria a US19-4.
2. **Tabela de agregados mantida por rotina.** Mais rápida, mas mais uma rotina e mais um ponto de
   divergência para o volume da demonstração.
3. **Agregar na consulta com `date_bin`** (escolhida). O índice `(dispositivo_id, tipo_grandeza,
   data_hora)` já existe.

## Decisão

- `GET /api/dispositivos/:id/historico?periodo=24h|7d|30d&grandeza=` devolve média, mínimo, máximo e
  quantidade de leituras por bloco (5 min em 24 h, 1 h em 7 e 30 dias), as grandezas que o
  dispositivo mediu nos últimos 30 dias e as regras ativas da grandeza (sem a regra do sistema).
  Sem grandeza informada, usa a da última leitura. Grandeza sem leitura no dispositivo é recusada
  com 400.
- A lista de dispositivos traz `ultimas3h`: nove médias de 20 min na grandeza da última leitura,
  nulas onde não houve leitura. Nove barras é o que o protótipo desenha; a altura vai de 4 a 16 px
  entre o menor e o maior valor da série.
- A cor da barrinha (`#9aa3a2`) não está no guia e entrou nos tokens, na seção dos valores tirados
  das telas, como `--cor-barrinha`, com `--altura-barrinha`.
- "Última leitura" mostra o valor e a unidade da leitura mais recente do próprio dispositivo; as
  duas colunas perdem a marca de previsto.
- "Ver histórico" fica no painel do dispositivo e desabilitado enquanto ele não tiver leitura.
- O gráfico reaproveita `GraficoLinha`, que passou a aceitar várias linhas de limite e a faixa entre
  mínimo e máximo. A tela recarrega a cada minuto.

## Consequências

- O histórico de um sensor de nível também mostra a vazão diária do Open-Meteo gravada para ele
  (US09), porque é leitura do mesmo dispositivo.
- "Ajustar limite", também no painel do protótipo, não tem critério na Sprint 6 e continua fora.
