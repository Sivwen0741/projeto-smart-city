# Regra de risco de enchente

- **Data:** 25/10/2026
- **Item:** US10, critérios 1 a 3 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

A US10 pede um alerta quando o nível do arroio passa da cota e, no mesmo bairro e dentro de uma
janela de tempo, a precipitação ou a previsão de vazão também passa do limite. O alerta precisa
informar as duas leituras, e os limites precisam ser configuráveis na tela de regras. As regras da
US23 comparam uma única grandeza com um limite.

## Alternativas consideradas

1. **Duas regras simples e uma terceira que olha os alertas delas.** A janela e o bairro ficariam
   espalhados em três cadastros, e o alerta composto dependeria de alertas que o operador pode
   encerrar.
2. **Uma tabela própria de regras compostas.** Duplicaria nome, gravidade, ativação e histórico, que
   a regra de alerta já tem.
3. **Um tipo de regra (`risco_enchente`) na mesma tabela, com três campos a mais** (escolhida).

## Decisão

- `regra_alerta` ganha `tipo` (`simples` ou `risco_enchente`), `limite_precipitacao`,
  `limite_vazao_prevista` e `janela_horas`. Na regra composta, grandeza, operador e limite principal
  são a cota do nível de água.
- A migração `RiscoDeEnchente` cria a regra "Risco de enchente": nível acima de 3,5 m e chuva a
  partir de 50 mm ou vazão prevista a partir de 15 m³/s, em 24 h, gravidade grave. Os valores são
  ponto de partida e se ajustam na tela de regras.
- Avaliação a cada leitura de nível: nível fora da cota e, no bairro do sensor, a maior chuva medida
  na janela; se não houver, a maior vazão do Open-Meteo (hoje e previsão até o fim da janela) do
  próprio sensor ou de outro ponto do bairro. Sensor sem bairro (zona rural) só conta a própria vazão.
- `alerta.composicao` (jsonb) guarda as duas leituras: nível (dispositivo, valor, cota, hora) e
  complemento (chuva ou vazão prevista, valor, limite, dispositivo, hora ou dia). Ela aparece na tela
  de alertas, no painel de reconhecimento e na fila do painel.
- Na tela de regras, a regra composta mostra a condição complementar; o formulário trava a grandeza
  em nível de água e acrescenta os três campos, com histórico de alteração como na US23. Não há
  cadastro de novas regras compostas.

## Consequências

- O DER ganha as quatro colunas de `regra_alerta` e `alerta.composicao`; entram na regeneração do
  diagrama no fechamento da Sprint 6.
- A cota da tela de rios continua sendo a menor regra ativa de nível, simples ou composta.
- O formulário de regras ganhou um bloco que não estava na prancheta; segue o padrão do próprio
  formulário da US23.
