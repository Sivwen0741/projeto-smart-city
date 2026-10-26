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

Todos usam a última leitura de cada dispositivo não inativo na última hora, e a variação compara com
a leitura do mesmo dispositivo cerca de uma hora antes. Sem leitura na última hora, o indicador fica
"sem dados".

| Indicador | Valor | Nota |
|---|---|---|
| Nível dos rios | maior nível de água, em m; barra com a cota em 80% | o ponto acima da cota, ou quantos pontos estão abaixo |
| Fluxo de veículos | velocidade média dos sensores de tráfego, em km/h | quantas vias são monitoradas |
| Qualidade do ar | pior índice dos EUA (AQI) calculado do PM2.5 das estações, tabela da EPA de 2024 | faixa (boa, moderada, insalubre) e em quantos bairros |
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
- Nenhum dispositivo de exemplo mede vagas: o indicador aparece "sem dados" até existir um sensor.
- O simulador publica os 9 pontos de IL-118 apagados, então a iluminação aparece com 0,0 % na
  demonstração. O cálculo segue os dados; mudar o valor seria mudar o episódio do simulador.
- A qualidade do ar ganha a fonte do Open-Meteo na US17.
