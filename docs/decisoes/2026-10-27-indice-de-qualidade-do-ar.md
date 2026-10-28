# Índice de qualidade do ar

- **Data:** 27/10/2026
- **Item:** US12-1 (indicador "Qualidade do ar" do painel) e US17-2 (camada "Qualidade do ar" do mapa)
- **Situação:** aceita (escolha do autor em 27/10/2026)

## Contexto

O painel calculava o índice de qualidade do ar dos EUA (AQI da EPA, tabela de 2024), e a prancheta
da Sprint 6 (`2026-10-25-prancheta-sprint-6.md`) previa as mesmas faixas na camada da US17. O
sistema é para a Prefeitura de Ponta Grossa, e o índice oficial no Brasil é o IQAr.

A Resolução Conama nº 506, de 5 de julho de 2024, estabeleceu os novos padrões nacionais e a forma
de cálculo do IQAr. O artigo 8º, § 2º determina:

> "Os órgãos ambientais devem atualizar seus sistemas eletrônicos para que as informações de
> qualidade do ar sejam divulgadas de acordo com a presente Resolução, a partir de 1º de janeiro de
> 2026."

Pontos da resolução que pesam no cálculo:

- A revogação da Resolução Conama nº 491/2018 é parcial (artigo 11, I): artigos 1º a 8º, 12 a 14 e
  Anexo I. O Anexo III da 491 continua valendo para episódios críticos de poluição e é citado pelo
  artigo 2º, V da 506.
- O artigo 8º, § 3º define que o limite superior da primeira faixa é o padrão final (PF) de cada
  poluente; o § 4º remete as demais faixas ao Guia Técnico. O Anexo II traz só a faixa N1 (Boa) e a
  equação.
- As demais faixas estão na orientação técnica do Ministério do Meio Ambiente e Mudança do Clima de
  janeiro de 2025, "Índice de qualidade do ar (IQAr)", que atualiza a forma de cálculo conforme o
  artigo 7º, § 1º e será incorporada ao Guia Técnico.

## Alternativas consideradas

1. **Manter o AQI dos EUA.** Contraria o artigo 8º, § 2º num sistema para a prefeitura.
2. **IQAr da Resolução Conama nº 491/2018 com o Guia Técnico de 2019.** Os artigos que tratavam do
   índice foram revogados pela 506.
3. **IQAr da Resolução Conama nº 506/2024, Anexo II, com a orientação técnica do MMA de janeiro de
   2025** (escolhida).

## Decisão

O índice é calculado do PM2.5, único poluente medido hoje, em média de 24 horas, com as faixas do
Quadro 1 da orientação técnica:

| Qualidade do ar | Índice | MP2,5 (µg/m³, 24 h) |
|---|---|---|
| N1 - Boa | 0 – 40 | 0 – 15 |
| N2 - Moderada | 41 – 80 | > 15 – 50 |
| N3 - Ruim | 81 – 120 | > 50 – 75 |
| N4 - Muito Ruim | 121 – 200 | > 75 – 125 |
| N5 - Péssima | 201 – 400 | > 125 – 300 |

- O limite de 15 µg/m³ da N1 confere com o PF de 24 h do Anexo I e com o Anexo II da 506. A
  orientação explica os demais limites: 50 é o PI-2 da 506, 75 é o *Interim Target* 1 da OMS (2021)
  e 125 é o nível de atenção da Resolução Conama nº 491/2018.
- Equação 1 da orientação: `IQAr = Iini + (Ifin − Iini) / (Cfin − Cini) × (C − Cini)`.
- A concentração é arredondada para o inteiro mais próximo antes do cálculo, e "X,500" vai para o
  par. Como no exemplo da orientação (151 para "> 150"), o início de cada faixa a partir da N2 é o
  inteiro seguinte: 16, 51, 76 e 126.
- O índice é arredondado para o inteiro mais próximo.
- Um único módulo (`api/src/qualidade-ar/iqar.ts`) faz o cálculo e a classificação, usado pelo
  painel e pela camada do mapa da US17.
- No painel, cada estação vale pela média das leituras das últimas 24 horas; a variação compara com
  a média que terminou uma hora antes. O indicador mostra o pior IQAr e a nota diz a qualidade
  ("moderada em 2 bairros").

## Fontes

- Resolução Conama nº 506/2024, DOU de 09/07/2024, edição 130, seção 1, página 133:
  https://www.in.gov.br/web/dou/-/resolucao-n-506-de-5-de-julho-de-2024-570885907
- Orientação técnica do MMA, janeiro de 2025:
  https://www.gov.br/mma/pt-br/assuntos/meio-ambiente-urbano-recursos-hidricos-qualidade-ambiental/qualidade-do-ar/indice-de-qualidade-do-ar-iqar/orientacao-tecnica-indice-de-qualidade-do-ar-jan-25.pdf
  Em 27/10/2026 o portal pedia autenticação (o MMA restringiu conteúdo no período eleitoral, de 4 de
  julho a 25 de outubro de 2026). As faixas foram lidas na cópia do Internet Archive de 24/07/2025
  (https://web.archive.org/web/20250724125438/ seguido do endereço acima), igual às cópias de
  fevereiro, março e abril de 2025 (mesmo resumo SHA-1).

## Consequências

- O indicador do painel passa de "AQI" para "IQAr", com cinco qualidades no lugar de três. A média
  de 24 horas muda devagar: um episódio de 20 minutos no simulador quase não move o índice.
- Em aberto, sem definição na fonte:
  - **PM2.5 acima de 300 µg/m³:** a N5 termina em 300; acima disso o índice fica em 400.
  - **Menos de 24 horas de leituras** (ambiente recém-criado ou estação nova): a média usa as
    leituras que existem na janela, sem exigir número mínimo.
  - **Cores na camada da US17:** a orientação usa verde, amarelo, laranja, vermelho e roxo; o guia
    de identidade tem só as cores de estado. A camada precisa ser desenhada e mostrada antes de
    implementar.
- A prancheta da Sprint 6 previa o índice dos EUA na camada da US17; esta decisão substitui essa
  parte.
