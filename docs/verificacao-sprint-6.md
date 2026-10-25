# Verificação dos critérios de aceite da Sprint 6

Relação entre os critérios de [`sprint-6-criterios.md`](sprint-6-criterios.md) e a forma como cada
um foi verificado. Este documento cresce a cada item mesclado na `main`.

- **Testes automatizados:** casos e2e em `api/test/`, com o número do critério no nome. Para
  rodar, veja a seção "Testes automatizados" do [README](../README.md).
- **Verificação manual:** feita pelo autor do código, nos critérios que dependem da tela ou do
  ambiente completo.
- **Revisão:** como nas sprints anteriores, sem revisão de outro integrante. A pendência segue no
  DT06 ([`verificacao-sprint-4.md`](verificacao-sprint-4.md)).

## TT02-9 - Dados do simulador identificados

Mesclada em 25/10/2026. Suíte completa: 125 testes passando num banco de teste recriado. Decisão
em [`2026-10-25-dados-do-simulador.md`](decisoes/2026-10-25-dados-do-simulador.md).

| Critério | Teste automatizado (`tt02.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **TT02-9** | a leitura do simulador é gravada com origem simulador e o dispositivo e o alerta aparecem como simulados | 25/10/2026, ambiente de desenvolvimento com o simulador: 9 dos 13 dispositivos com a marca "simulado" na lista (os 4 sem marca, EA-07, SN-014, SN-019 e SN-027, estão inativos ou sem comunicação) e na chamada do mapa (CAM-08). Uma leitura de chuva de 72 mm publicada com origem `simulador` em EA-02 gerou o alerta grave com a marca na tela de alertas e na fila do painel. A marca na tela não tem teste automatizado (DT05). | Verificado, tela manual |
