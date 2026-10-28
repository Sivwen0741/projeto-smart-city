# Indicadores do painel

- **Data:** 25/10/2026
- **Item:** US12, critérios 1 a 5 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

A faixa de `02-painel.svg` tem seis indicadores (nível dos rios, fluxo de veículos, qualidade do ar,
iluminação pública, ruído urbano e vagas) e, abaixo do mapa, dois gráficos de ocorrências. A US12
pede que tudo venha das leituras e das ocorrências registradas, sem valor inventado. Alguns valores
do protótipo dependem de dados que o modelo não tem, como a capacidade das vias ou o total de vagas.

## Alternativas consideradas

1. **Reproduzir as unidades do protótipo com constantes** (por exemplo, capacidade fixa de cada via
   para chegar a "68 %"). Seria número inventado, contra a US12-3.
2. **Cada indicador com a medida que os dispositivos de fato produzem** (escolhida).

## Decisão

Todos usam a última leitura de cada dispositivo não inativo na última hora (a qualidade do ar usa a média de 24 h dessas estações), e a variação compara com
a leitura do mesmo dispositivo cerca de uma hora antes. Sem leitura na última hora, o indicador fica
"sem dados".

| Indicador | Valor | Nota |
|---|---|---|
| Nível dos rios | maior nível de água, em m; barra com a cota em 80% | o ponto acima da cota, ou quantos pontos estão abaixo |
| Fluxo de veículos | velocidade média dos sensores de tráfego, em km/h | quantas vias são monitoradas |
| Qualidade do ar | pior IQAr (Resolução Conama nº 506/2024) calculado da média de 24 h do PM2.5 das estações; ver `2026-10-27-indice-de-qualidade-do-ar.md` | qualidade (boa, moderada, ruim, muito ruim, péssima) e em quantos bairros |
| Iluminação pública | parcela de pontos de luz respondendo, pelos pontos apagados e pelo total de cada controlador | quantos pontos não respondem |
| Ruído urbano | maior nível sonoro, em dB | dentro ou acima do limite da regra de ruído |
| Vagas públicas | soma das vagas livres medidas | em quantos sensores |

- **Cor:** com alerta ativo grave da grandeza, a peça fica vermelha (fundo, valor, barra e nota),
  como o nível dos rios no protótipo; com alerta de atenção, só a barra fica âmbar, como o fluxo no
  protótipo; sem alerta, a barra é verde.
- **"Ocorrências abertas hoje":** acumulado por hora de hoje contra a média do acumulado nos quatro
  mesmos dias da semana anteriores, como o subtítulo do protótipo ("quatro terças anteriores").
- **"Ocorrências por bairro":** os cinco bairros com mais ocorrências nas últimas 24 horas.
- **Tempo real:** a tela consulta `GET /api/painel` a cada leitura nova, alerta ou ocorrência, no
  máximo uma vez a cada 5 s, além de a cada 30 s.

## Consequências

- Fluxo em km/h e vagas sem total são diferenças de unidade em relação ao protótipo, registradas aqui.
- Para o painel não abrir com indicadores vazios, os exemplos ganharam o tipo "Sensor de vagas" e o
  SV-212 (rotativo do centro, fora do protótipo), publicado pelo simulador, e o episódio de IL-118
  passou a ter um ponto apagado, com falha de 4 dos 9 pontos por 15 min a cada hora. Os indicadores
  continuam calculados das leituras.
- A qualidade do ar ganha a fonte do Open-Meteo na US17.
