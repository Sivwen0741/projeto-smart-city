# Tela de alertas e fila do painel

- **Data:** 24/10/2026
- **Item:** US02, critérios 1 a 4 (`docs/sprint-5-criterios.md`)
- **Situação:** aceita

## Contexto

A tela de alertas existe no protótipo (`design/03-alertas.svg`), com subabas, quatro
indicadores, barra de busca e filtros, e a tabela. Alguns dados que ela mostra não estão no
modelo de dados, e alguns botões pertencem a outras histórias.

## Alternativas consideradas

1. **Implementar só a lista de ativos.** As subabas "Em atendimento" e "Encerrados hoje" ficariam
   desabilitadas, embora custem só um filtro.
2. **Implementar as três visões, os quatro indicadores e a fila do painel, com os botões de outras
   histórias desabilitados** (escolhida).

## Decisão

- **Visões:** "Ativos" (abertos e em atendimento), "Em atendimento" e "Encerrados hoje", por
  `GET /api/alertas?visao=...`. "Regras de alerta" leva à tela de regras.
- **Ordem:** grave, atenção e informativo; na mesma gravidade, o mais recente primeiro.
- **Órgão:** o alerta não tem órgão no modelo. A coluna mostra o órgão da ocorrência vinculada
  ao alerta e "–" enquanto não houver ocorrência (a vinculação é da US05).
- **Indicadores:** ativos e graves sem reconhecimento; tempo médio até o reconhecimento nas
  últimas 24 h; alertas nas últimas 24 h e quantos já foram encerrados; dispositivos sem
  comunicação, por tipo. A "meta do plantão: 15 min" é um texto fixo tirado do protótipo, porque
  não existe cadastro de meta.
- **Medição:** o limite usa as mesmas casas decimais da medição ("3,81 m, limite 3,50 m").
- **Fila do painel:** os mesmos alertas ativos, na mesma ordem, no lugar previsto em
  `02-painel.svg`, com o contador "N · M graves" e "Ver todos".
- **Menu:** a aba "Alertas" mostra a quantidade de alertas ativos, como no protótipo.
- **Atualização:** a cada 15 s. A chegada imediata é da US03.

## Consequências

- Continuam desabilitados com a marca da sprint: "Reconhecer" e "Detalhes" (US04, sprint 5),
  "Abrir" a ocorrência (US06, sprint 6), busca (US26), filtros (US08) e exportar (US25).
- O protótipo mostra o filtro "Grave e atenção" ligado. Como os filtros são da US08, ele aparece
  desligado e a lista traz todas as gravidades.
- A coluna `alerta.data_encerramento` entrou por migração
  (`2026-10-24-ajustes-der-sprint-5.md`).
