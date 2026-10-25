# Mapa da cidade: cores, agrupamento, ocorrências e aba Mapa

- **Data:** 24/10/2026
- **Item:** US01, critérios 1 a 6 (`docs/sprint-5-criterios.md`)
- **Situação:** aceita; os elementos fora do protótipo foram mostrados ao usuário e aprovados em
  24/10/2026

## Contexto

O mapa existe no protótipo só como parte do painel (`design/02-painel.svg`): marcadores
quadrados com a legenda grave, atenção, normal e sem comunicação, nomes de bairro, chamada escura
ao lado do marcador e o botão "Tela cheia". O protótipo não mostra marcador de ocorrência, não
mostra como os marcadores se agrupam e não diz onde entram os dispositivos em manutenção. O resto
do painel pertence a outras histórias: indicadores e gráficos (US12) e a fila de alertas ativos
(US02).

## Alternativas consideradas

1. **Fazer só a aba Mapa e manter o painel desabilitado.** O protótipo põe o mapa no painel,
   que é a tela inicial do operador.
2. **Painel como tela inicial, com o mapa funcionando e as demais partes desabilitadas com a
   marca da sprint; aba Mapa com o mesmo mapa em tela cheia** (escolhida).

## Decisão

- **Cor do marcador:** grave ou atenção quando o dispositivo tem alerta ativo dessa gravidade.
  Sem alerta, normal se está operando e cinza se está sem comunicação ou em manutenção. Alerta
  informativo não muda a cor, porque a legenda do protótipo não o destaca. Dispositivo inativo
  não aparece.
- **Legenda:** a cinza diz "Sem comunicação ou manutenção", para a soma da legenda bater com o
  total de dispositivos. Entrou também o item "Ocorrência aberta".
- **Ocorrência:** anel redondo na cor da gravidade, acima dos dispositivos.
- **Agrupamento:** quadrado verde-escuro com a contagem, só para os normais e os cinzas. Grave e
  atenção nunca se agrupam, para não sumirem dentro de um número.
- **Chamada:** clique no marcador. Para dispositivo: código e tipo; endereço, bairro e última
  leitura; situação e última comunicação. Para ocorrência: protocolo, categoria e bairro,
  gravidade e situação.
- **Bairros:** contorno tracejado e nome em caixa alta, a partir de `GET /api/territorio/bairros`
  (camada do OSM simplificada em cerca de 10 m).
- **Base:** o OpenStreetMap em tons de cinza, para ficar perto do mapa de papel do protótipo.
- **Atualização:** a cada 15 s, com "atualizado há N s" na barra, como no protótipo. A
  atualização imediata de alertas é a US03.
- **Aba Mapa:** o mesmo componente em tela cheia; o botão "Tela cheia" do painel leva a ela.
- A API passou a informar, em cada dispositivo, a maior gravidade entre os alertas ativos
  (`alertaAtivo`) e a última leitura (`ultimaLeitura`). A listagem de ocorrências abertas
  (`GET /api/ocorrencias`) considera aberta a ocorrência sem data de encerramento.

## Consequências

- O painel virou a tela inicial depois do login. Indicadores e gráficos continuam desabilitados
  com "sprint 6" (US12), e a fila de alertas com "sprint 5" (US02).
- "Filtrar" (US08) e "Camadas" (US27) continuam desabilitados.
- A coluna "Última leitura" da tela de dispositivos continua marcada para a US19, embora a API já
  traga o valor: o protótipo põe nela um gráfico das últimas 3 h, que é da US19.
