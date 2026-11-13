# Log de execução — Sprint 6

Seção 3 da documentação de teste. Versão sob teste na rodada 1: tag `v1.0-sprint-6` (commit
`01ecf29`); na rodada 2, de 12/11/2026, tag `v1.0.2-sprint-6` (commit `0a38751`), com as correções
dos INC-001 a INC-004 (seção "Rodada 2", abaixo). Rodada 1 num
clone da tag numa pasta separada do repositório de trabalho, sem nenhum arquivo alterado além do
`.env` criado a partir do `.env.example`. As evidências ficam em [`evidencias/`](evidencias/),
uma pasta por rodada (`AAAA-MM-DD-rodada-N/`), com a convenção do [README](evidencias/README.md)
da pasta. As colunas da tabela de casos são as da seção "Formato dos registros da execução" do
plano.

## Rodadas

| Rodada | Data e hora (BRT) | O quê | Total | Aprovados | Falhas | Evidência |
|---|---|---|---|---|---|---|
| 1 | 02/11/2026 21:09 a 21:12 | CT-005: ensaio seguindo só o README | 1 caso | ver registro abaixo | 0 | registro abaixo |
| 1 | 02/11/2026 21:13:10 a 21:13:39 | Smoke test da seção 1.3 (CT-001, CT-006, CT-026, CT-040, CT-056), parte automatizável, contra o ambiente no ar | 5 casos | 5 | 0 | `2026-11-02-rodada-1/smoke.txt` |
| 1 | 02/11/2026 21:13:50 a 21:14:12 | Suíte de unidade, com cobertura | 53 testes em 4 suítes | 53 | 0 | `2026-11-02-rodada-1/unidade.txt` |
| 1 | 02/11/2026 21:14:17 a 21:15:40 | Suíte de integração e sistema, em série (`--runInBand`), banco de teste recriado | 216 testes em 20 suítes | 216 | 0 | `2026-11-02-rodada-1/integracao.txt` |
| 1 | 02/11/2026 21:15:47 a 21:15:55 | Coleção do Postman pelo Newman 6.2.1, contra o ambiente no ar | 74 requisições, 133 verificações | 133 | 0 | `2026-11-02-rodada-1/newman.txt` |

| Reteste INC-001 | 02/11/2026 21:25:36 a 21:28:32 | CT-005 na versão corrigida `0c48fd4`, segunda instância isolada pelo `.env`, com regressão: unidade e integração, banco de teste recriado | 1 caso; 53 + 216 testes | 1; 53 + 216 | 0 | `2026-11-02-reteste-INC-001/` |
| Reteste INC-002 | 02/11/2026 21:30:25 a 21:34:54 | CT-005 na versão corrigida `1a64496`, com regressão: unidade e duas execuções da integração, banco de teste recriado em cada uma | 1 caso; 53 testes; 216 + 216 testes | 1; 53; 215 + 216 | 1 na 1ª execução da integração (US02-3, INC-003) | `2026-11-02-reteste-INC-002/` |
| Reteste INC-003, execução 1 | 02/11/2026 21:42:10 a 21:43:46 | Integração e sistema na versão corrigida `6439f63`, banco de teste recriado | 216 testes | 216 | 0 | `2026-11-02-reteste-INC-003/integracao-1.txt` |
| Reteste INC-003, execução 2 | 02/11/2026 21:43:46 a 21:45:20 | Idem, banco de teste recriado de novo | 216 testes | 216 | 0 | `2026-11-02-reteste-INC-003/integracao-2.txt` |
| Reteste INC-003, execução 3 | 02/11/2026 21:45:20 a 21:46:48 | Idem, banco de teste recriado de novo | 216 testes | 216 | 0 | `2026-11-02-reteste-INC-003/integracao-3.txt` |
| Reteste INC-004 | 02/11/2026 21:52 a 21:58:39 | CT-129 e CT-130 na versão corrigida `a73fdd9`, Chrome em 1440 × 900, e regressão: unidade e integração, banco de teste recriado | 2 casos; 53 + 216 testes | 2; 53 + 216 | 0 | `2026-11-02-reteste-INC-004/` |
| 2 | 12/11/2026 20:05 a 20:46 | Casos de tela pendentes da rodada 1 (57 "automatizado e manual", 6 só manuais e o painel do CT-005), na `v1.0.2-sprint-6`, por automação de navegador | 64 casos | 61 | 3 (CT-018, CT-111, CT-127: INC-007, INC-006, INC-008) | `CT-NNN.png`; `2026-11-12-rodada-2/` |
| 2 | 12/11/2026 20:47:05 a 20:54:22 | Suíte de integração e sistema, cinco execuções seguidas, banco de teste recriado antes de cada uma, na `v1.0.2-sprint-6` | 5 × 216 testes | 5 × 216 | 0 | `2026-11-12-rodada-2/integracao-1.txt` a `integracao-5.txt` |
| 2 | 12/11/2026 20:55 | Suíte de unidade, com cobertura, na `v1.0.2-sprint-6` | 53 testes | 53 | 0 | `2026-11-12-rodada-2/unidade.txt` |
| 2 | 12/11/2026 21:13 | Coleção do Postman pelo Newman 6.2.1, na `v1.0.2-sprint-6`, contra o ambiente da rodada | 74 requisições, 133 verificações | 133 | 0 | `2026-11-12-rodada-2/newman.txt` |

Cobertura da suíte de unidade: 98,3% das instruções, 81,44% dos desvios, 95,91% das funções e
98,79% das linhas.

Todos os comandos do Compose usaram `-p teste-sprint-6`. O nome do projeto é fixo (`scoc`) no
`docker-compose.yml`, e sem essa opção o clone dividiria o banco com a cópia de desenvolvimento da
mesma máquina (INC-001).

Dados que as rodadas deixaram no ambiente da versão sob teste e que aparecem nos casos de tela: as
leituras e as ocorrências 2026-11-0001 e 2026-11-0002, do smoke; e, da coleção do Postman, o
dispositivo `PM-MVZXSVM8`, a regra "Validação no Postman PM-MVZXSVM8", o usuário
`postman.<número>@pontagrossa.pr.gov.br`, as ocorrências 2026-11-0003 e 2026-11-0004 e um alerta
reconhecido.

## Casos

Linhas dos casos executados na rodada 1 e nos retestes. Situação segue o vocabulário do plano:
passou, falhou, bloqueado ou pendente (tela). O último valor foi acrescentado durante a execução e
marca o caso cuja parte automatizada passou e cuja verificação de tela ainda não foi executada. Os casos só manuais ainda não executados (CT-004, CT-038, CT-039,
CT-043, CT-082 e CT-107) entram quando forem executados.

| Caso | Data | Versão (tag ou commit) | Quem executou | Resultado obtido | Situação | Evidência | Incidente |
|---|---|---|---|---|---|---|---|
| CT-001 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Smoke: parte automatizável passou contra o ambiente no ar. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `tt01.e2e-spec.ts`; `2026-11-02-rodada-1/smoke.txt` |  |
| CT-002 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt01.e2e-spec.ts` |  |
| CT-003 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt01.e2e-spec.ts` |  |
| CT-005 | 02/11 | `v1.0-sprint-6` | Bryan Charles, autor do README (DT08) | Ambiente subiu seguindo o README, com `-p` de fora dele (INC-001); login do administrador funcionou pelo comando do README; a interface web respondeu 200 e a API listou os 14 dispositivos de exemplo. "O painel abre com os dispositivos de exemplo" fica para o registro de quem executa o caso pela tela. Pré-condição atendida parcialmente: máquina com Node 24.1.0 (Homebrew) e sem PostgreSQL; nenhum passo do README usou o Node (registro abaixo). | pendente (tela) | Registro do CT-005, abaixo | INC-001, INC-002 |
| CT-005 (reteste do INC-001) | 02/11 | `0c48fd4` | Bryan Charles, autor do README (DT08) | Segunda instância subiu isolada sem `-p`, com `COMPOSE_PROJECT_NAME` e portas no `.env`, como o README corrigido manda; outras cópias intactas; `down -v` removeu só os volumes dela; regressão 53/53 e 216/216. | passou | `2026-11-02-reteste-INC-001/reteste.txt` | INC-001 |
| CT-005 (reteste do INC-002) | 02/11 | `1a64496` | Bryan Charles, autor do README (DT08) | A seção "Situação" descreve a Sprint 6 e a tag `v1.0-sprint-6`, sem citar a Sprint 4 como sprint em andamento, e os oito links existem; o ambiente subiu isolado pelo `.env`, e o login funcionou. Regressão: unidade 53/53; integração 215/216 na 1ª execução (US02-3) e 216/216 na 2ª. | passou | `2026-11-02-reteste-INC-002/reteste.txt` | INC-002, INC-003 |
| CT-006 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Smoke: parte automatizável passou contra o ambiente no ar. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us20.e2e-spec.ts`; `2026-11-02-rodada-1/smoke.txt` |  |
| CT-007 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us20.e2e-spec.ts` |  |
| CT-008 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us20.e2e-spec.ts` |  |
| CT-009 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us20.e2e-spec.ts` |  |
| CT-010 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us20.e2e-spec.ts` |  |
| CT-011 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us20.e2e-spec.ts` |  |
| CT-012 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us20.e2e-spec.ts` |  |
| CT-013 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-014 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-015 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-016 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-017 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-018 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-019 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-020 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us23.e2e-spec.ts` |  |
| CT-021 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us23.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `regra.spec.ts` |  |
| CT-022 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us23.e2e-spec.ts` |  |
| CT-023 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us23.e2e-spec.ts` |  |
| CT-024 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us23.e2e-spec.ts` |  |
| CT-025 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us23.e2e-spec.ts` |  |
| CT-026 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. Smoke passou. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts`; `2026-11-02-rodada-1/smoke.txt` |  |
| CT-027 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-028 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-029 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-030 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-031 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-032 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-033 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts` |  |
| CT-034 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us01.e2e-spec.ts` |  |
| CT-035 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us01.e2e-spec.ts` |  |
| CT-036 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us01.e2e-spec.ts` |  |
| CT-037 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us01.e2e-spec.ts` |  |
| CT-040 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Smoke: parte automatizável passou contra o ambiente no ar. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us02.e2e-spec.ts`; `2026-11-02-rodada-1/smoke.txt` |  |
| CT-041 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us02.e2e-spec.ts` |  |
| CT-042 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us02.e2e-spec.ts` |  |
| CT-042 (reteste do INC-003) | 02/11 | `6439f63` | Bryan Charles | Parte automatizada: o US02-3 corrigido conta só os dispositivos do próprio teste e passou nas três execuções seguidas, com o banco recriado em cada uma (216/216 nas três). Parte da tela: não executada. | pendente (tela) | `2026-11-02-reteste-INC-003/` | INC-003 |
| CT-044 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us03.e2e-spec.ts` |  |
| CT-045 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us03.e2e-spec.ts`, `us04.e2e-spec.ts` |  |
| CT-046 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us03.e2e-spec.ts` |  |
| CT-047 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us03.e2e-spec.ts` |  |
| CT-048 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us28.e2e-spec.ts` |  |
| CT-049 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us28.e2e-spec.ts` |  |
| CT-050 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us28.e2e-spec.ts` |  |
| CT-051 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us28.e2e-spec.ts` |  |
| CT-052 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us04.e2e-spec.ts` |  |
| CT-053 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us04.e2e-spec.ts` |  |
| CT-054 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us04.e2e-spec.ts` |  |
| CT-055 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us04.e2e-spec.ts` |  |
| CT-056 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Smoke: parte automatizável passou contra o ambiente no ar. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us05.e2e-spec.ts`; `2026-11-02-rodada-1/smoke.txt` |  |
| CT-057 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us05.e2e-spec.ts` |  |
| CT-058 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us05.e2e-spec.ts` |  |
| CT-059 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us05.e2e-spec.ts` |  |
| CT-060 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us05.e2e-spec.ts` |  |
| CT-061 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us05.e2e-spec.ts` |  |
| CT-062 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-063 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-064 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-065 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-066 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-067 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-068 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-069 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us23.e2e-spec.ts` |  |
| CT-070 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-071 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/unidade.txt` › `regra.spec.ts` |  |
| CT-072 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us04.e2e-spec.ts` |  |
| CT-073 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us04.e2e-spec.ts` |  |
| CT-074 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us04.e2e-spec.ts` |  |
| CT-075 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us28.e2e-spec.ts` |  |
| CT-076 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us28.e2e-spec.ts` |  |
| CT-077 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us28.e2e-spec.ts` |  |
| CT-078 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts`, `us22.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `comunicacao.spec.ts` |  |
| CT-079 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us22.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `comunicacao.spec.ts` |  |
| CT-080 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts`, `us22.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `comunicacao.spec.ts` |  |
| CT-081 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts`, `us01.e2e-spec.ts`, `us22.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `comunicacao.spec.ts` |  |
| CT-083 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `tt02.e2e-spec.ts` |  |
| CT-084 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-085 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-086 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-087 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-088 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-089 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-090 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us07.e2e-spec.ts` |  |
| CT-091 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us07.e2e-spec.ts` |  |
| CT-092 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us07.e2e-spec.ts` |  |
| CT-093 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us07.e2e-spec.ts` |  |
| CT-094 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us09.e2e-spec.ts` |  |
| CT-095 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us09.e2e-spec.ts` |  |
| CT-096 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us09.e2e-spec.ts` |  |
| CT-097 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us09.e2e-spec.ts` |  |
| CT-098 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-099 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-100 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-101 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-102 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-103 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-104 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-105 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-106 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us10.e2e-spec.ts` |  |
| CT-108 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us12.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `indicadores.spec.ts` |  |
| CT-109 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us12.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `indicadores.spec.ts` |  |
| CT-110 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us12.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `indicadores.spec.ts` |  |
| CT-111 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us12.e2e-spec.ts` |  |
| CT-112 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us12.e2e-spec.ts` |  |
| CT-113 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us12.e2e-spec.ts`; `2026-11-02-rodada-1/unidade.txt` › `iqar.spec.ts` |  |
| CT-114 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us26.e2e-spec.ts` |  |
| CT-115 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us26.e2e-spec.ts` |  |
| CT-116 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us26.e2e-spec.ts` |  |
| CT-117 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us26.e2e-spec.ts` |  |
| CT-118 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-119 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-120 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-121 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-122 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-123 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-124 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-125 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us21.e2e-spec.ts` |  |
| CT-126 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us18.e2e-spec.ts` |  |
| CT-127 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us18.e2e-spec.ts` |  |
| CT-128 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us18.e2e-spec.ts` |  |
| CT-129 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us19.e2e-spec.ts` |  |
| CT-129 (reteste do INC-004) | 02/11 | `a73fdd9` | Bryan Charles | Parte da tela, reteste do INC-004: o gráfico de 24 h do SN-014 cabe sem rolagem em 1440 × 900, com 320 px de altura, eixos em 11 px, eixo do tempo e legenda dos limites visíveis. Os outros períodos e a troca de grandeza ficam para a execução manual. | pendente (tela) | `2026-11-02-reteste-INC-004/CT-129.png` | INC-004 |
| CT-130 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us19.e2e-spec.ts` |  |
| CT-130 (reteste do INC-004) | 02/11 | `a73fdd9` | Bryan Charles | Parte da tela, reteste do INC-004: no histórico de PM2.5 da EA-03, a linha tracejada de 55 µg/m³ e a legenda aparecem sem rolagem em 1440 × 900. A verificação de que as regras desativadas não aparecem fica para a execução manual. | pendente (tela) | `2026-11-02-reteste-INC-004/CT-130.png` | INC-004 |
| CT-131 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us19.e2e-spec.ts` |  |
| CT-132 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us19.e2e-spec.ts` |  |
| CT-133 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-134 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-135 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-136 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-137 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-138 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-139 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |

## Rodada 2 — casos de tela (12/11/2026)

Execução das verificações de tela que ficaram como "pendente (tela)" na rodada 1: os 57 casos
"automatizado e manual", os 6 só manuais (CT-004, CT-038, CT-039, CT-043, CT-082 e CT-107) e a
parte do painel do CT-005, 64 casos ao todo. A divisão entre os integrantes não se concretizou, e os
casos foram executados por automação de navegador conduzida por um único integrante, Bryan Charles
(seção 5.3 do relatório de conclusão). Por isso a coluna "Quem executou" registra a forma de
execução, e não um nome. CT-004 e CT-126, que não têm tela, foram executados por comandos no
terminal ("automação de terminal").

**Versão e ambiente.** Tag `v1.0.2-sprint-6` (commit `0a38751`), clone novo numa pasta separada
(`~/teste-v102`), banco limpo, projeto do Compose próprio (`COMPOSE_PROJECT_NAME=teste-v102` no
`.env`, com segredos novos gerados por `openssl rand -hex`). Subida às 20:05; casos das 20:09 às
20:46 (BRT). Google Chrome no macOS 15.7 (arm64), Docker 28.1.1, Compose 2.35.1. Viewport de
1440 × 763 px na maior parte dos casos; os primeiros, até o CT-054, numa janela de 1120 × 944 px.

**Evidências.** Uma captura por caso em `evidencias/CT-NNN.png`, ou `CT-NNN-1.png`, `CT-NNN-2.png`
quando o caso tem mais de uma tela, como pedido para esta rodada. As saídas de terminal e banco
ficam em `evidencias/2026-11-12-rodada-2/`.

**Preparação de dados, registrada como pré-condição.** Tudo pela interface do sistema (tela,
interface de programação ou MQTT), sem comando manual no banco:

- Regra "Nível de atenção (teste)", ≥ 2 m, 0 min, atenção: cadastrada pela tela no CT-020 e usada no
  CT-034, CT-048 e CT-069; desativada pela tela às 20:37, antes do CT-107, para a cota voltar a 3,5 m.
- Regra "Temperatura crítica (teste)", > 40 °C, 0 min, grave: criada pela interface de programação
  às 20:16, porque a EA-07 não mede precipitação. A mensagem de chuva publicada para ela foi
  descartada, o que é o comportamento esperado.
- Usuários "Consulta Mobilidade (teste)" e "Gestor Meio Ambiente (teste)": criados pela interface de
  programação para o CT-119; o operador da Defesa Civil foi cadastrado pela tela no CT-118.
- 753 leituras retroativas de nível do SN-027, publicadas pelo MQTT com `dataHora`, cobrindo 30 dias
  por hora e as últimas 3 h a cada 5 min, com valores de 1,15 m a 1,85 m: CT-129 e CT-131
  (`2026-11-12-rodada-2/preparacao-SN-027-historico.jsonl`).
- Dispositivo SN-901, cadastrado pela tela no CT-013 e usado no CT-070 e no CT-071; estação EA-901 em
  Ronda, só com precipitação, criada pela interface de programação para o CT-100 e o CT-107.
- Regra "Fronteira do operador (teste)": criada, alterada e desativada pela interface de programação
  dentro do CT-071.
- CT-127 e CT-128: limite da regra "Material particulado elevado" baixado para 5 pela tela às 20:41 e
  devolvido a 55 às 20:44, como manda o README das evidências. O CT-126 foi executado antes, com o
  limite original.

| Caso | Data | Versão (tag ou commit) | Quem executou | Resultado obtido | Situação | Evidência | Incidente |
|---|---|---|---|---|---|---|---|
| CT-001 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Clone novo da tag, banco limpo, `docker compose up --build -d`, das 20:05:04 às 20:08:25, com a construção das imagens; `db`, `mosquitto` e `api` saudáveis, `simulador` e `web` em execução (sem verificação de saúde no Compose); health 200 com PostGIS 3.4.3; a tela de login abre. | passou | `CT-001.png`; `2026-11-12-rodada-2/CT-001.txt` |  |
| CT-004 | 12/11 | `v1.0.2-sprint-6` | automação de terminal | `git ls-files` só lista `.env.example`; `git log --all -- .env` vazio; `.env` no `.gitignore`; a busca por senha, segredo e token literais só achou nomes de dependência no `package-lock.json` e valores falsos nos testes; o Compose lê as credenciais do `.env`. | passou | `2026-11-12-rodada-2/CT-004.txt` |  |
| CT-005 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Parte da tela: depois do login do administrador, o painel abriu com os dispositivos de exemplo (14 cadastrados; 13 no mapa, o SN-019 inativo fora). As partes de subida e login seguem o registro da rodada 1. Executado pelo autor do README, por automação: sem independência (DT08). | passou | `CT-005.png` | DT08 |
| CT-006 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Login pela tela com o administrador, senha mascarada; "Entrar" leva ao painel. | passou | `CT-006-1.png`, `CT-006-2.png` |  |
| CT-013 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Vazio: "Escolha o tipo do dispositivo." e "Informe o código identificador."; latitude 999: "Marque o ponto no mapa ou informe latitude e longitude.". Preenchido com código, tipo, descrição, coordenada, endereço, data, situação e grandeza: bairro calculado "Centro · distrito Ponta Grossa"; SN-901 cadastrado e aberto em edição com os campos devolvidos. | passou | `CT-013-1.png` a `CT-013-5.png` | INC-005 (data em mês/dia, já aberto) |
| CT-018 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Colunas Código, Tipo, Localização, Situação, Última leitura, Últimas 3 h e Comunicação; cada cabeçalho ordenável alterna crescente e decrescente. A ordem por Tipo e por Localização põe os nomes acentuados no fim: "Controlador de iluminação" antes de "Câmera"; "Órfãs" depois de "Uvaranas". | falhou | `CT-018-1.png`, `CT-018-2.png` | INC-007 |
| CT-020 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Regra "Nível de atenção (teste)", nível de água ≥ 2 m, 0 min, atenção, cadastrada pela tela; aparece na lista (10 regras, 9 ativas) com "Regra cadastrada" no histórico. | passou | `CT-020-1.png`, `CT-020-2.png` |  |
| CT-024 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Botão de salvar desabilitado e mensagem em cada caso: limite vazio ("Informe o valor limite."), operador não escolhido ("Para salvar, corrija: operador."), duração −5 ("Não pode ser negativa. Use 0 para disparar na primeira leitura."). | passou | `CT-024-1.png` a `CT-024-3.png` |  |
| CT-033 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Log do simulador: "11 dispositivos a cada 30 s"; os 11 dispositivos do simulador operando na tela, com a marca "simulado"; leituras com origem `simulador`; a comunicação da EA-07 e do SN-027, que não são simulados, só mudou quando publiquei por MQTT. | passou | `CT-033.png`; `2026-11-12-rodada-2/CT-033.txt` |  |
| CT-034 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Painel: Grave · 2 (SN-014 e EA-02, com halo), Atenção · 1 (SN-027), Normal · 8, Sem comunicação ou manutenção · 2 (EA-07, IL-118); SN-019 inativo fora; dispositivo com grave e atenção fica grave. Alerta da regra do sistema não pinta o marcador: a EA-07 fica cinza, como sem comunicação. | passou | `CT-034-1.png`, `CT-034-2.png` |  |
| CT-035 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Três ocorrências abertas com marcador de anel na cor da gravidade (Ronda grave, Uvaranas atenção, zona rural informativo); a encerrada sai do mapa (CT-088). | passou | `CT-035.png` |  |
| CT-036 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Dispositivo: "SN-042 · sensor de ruído", endereço e bairro, 59,9 dB, "Operando · comunicação há 27 s", marca simulado. Ocorrência: "Ocorrência 2026-11-0001", "Alagamento · Ronda", "Grave · Aberta". | passou | `CT-036-1.png`, `CT-036-2.png` |  |
| CT-037 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Aba Mapa com 16 polígonos e 16 nomes; no DOM, o centro de cada nome cai dentro de exatamente um polígono, um polígono por nome. | passou | `CT-037.png` |  |
| CT-038 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | No zoom afastado, grupos com contagem ("2" e "4"); os graves ficam fora dos grupos; aproximando sobre o Centro, o grupo passa a "3" e depois se desfaz em quatro marcadores. | passou | `CT-038-1.png` a `CT-038-3.png` |  |
| CT-039 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Com a aba Mapa aberta: leitura que dispara alerta grave na EA-07 pinta o marcador de vermelho com halo; ocorrência registrada em outra aba aparece com o marcador; nos dois casos, sem recarregar (variável da página preservada). | passou | `CT-039-1.png` a `CT-039-3.png` |  |
| CT-040 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Colunas gravidade, alerta (regra, endereço e bairro), dispositivo, medição com limite, detecção, órgão ("Defesa Civil" no alerta vinculado à ocorrência 2026-11-0004) e situação; Ativos (abertos e em atendimento), Em atendimento e Encerrados hoje mostram os conjuntos de cada visão. | passou | `CT-040-1.png` a `CT-040-3.png` |  |
| CT-042 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | 5 ativos, 2 graves sem reconhecimento; tempo médio "–" sem reconhecimento e "1 min" depois do primeiro; 6 em 24 h, 1 encerrado; 1 dispositivo sem comunicação (1 estação ambiental). Conferido com a lista da interface de programação no mesmo minuto. | passou | `CT-042.png` |  |
| CT-043 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Quadro "Alertas ativos" do painel e tela de Alertas com os mesmos cinco alertas na mesma ordem. | passou | `CT-043-1.png`, `CT-043-2.png` |  |
| CT-044 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Três abas abertas (Alertas, Mapa, Painel) e medição pelo relógio da página: o alerta apareceu entre 0,42 s e 0,67 s depois da publicação na lista, no quadro do painel, nos dois mapas e no contador do menu. | passou | `CT-044-1.png` a `CT-044-4.png`; `2026-11-12-rodada-2/CT-044.txt` |  |
| CT-047 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Interface de programação parada das 20:40:31 às 20:40:51; logo depois da volta, a leitura que dispara alerta foi publicada, e o alerta apareceu na lista 0,36 s depois, sem recarregar. | passou | `CT-047.png`; `2026-11-12-rodada-2/CT-047.txt` |  |
| CT-048 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Alerta de atenção sem reconhecimento (SN-027) saiu dos ativos sozinho quando a leitura normalizou e apareceu em Encerrados hoje; os graves continuaram. | passou | `CT-048-1.png` a `CT-048-3.png` |  |
| CT-049 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Faixa em todas as telas autenticadas (painel, alertas, ocorrências, mapa, dispositivos, regras, usuários) com a quantidade e "Ver alerta", sem botão de fechar; "Ver alerta" abre o grave mais antigo; reconhecidos os graves (seis pela interface de programação e o último pela tela), a faixa sumiu nas três sessões abertas. | passou | `CT-049-1.png` a `CT-049-12.png`; `2026-11-12-rodada-2/CT-049.txt` |  |
| CT-050 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Com graves sem reconhecimento: depois de recarregar, a faixa continua; depois de Sair e entrar como "Operador Defesa Civil (teste)", a faixa continua com o mesmo texto. | passou | `CT-050-1.png` a `CT-050-3.png` |  |
| CT-051 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Os graves sem reconhecimento ficam acima do grave em atendimento mais recente. | passou | `CT-051.png` |  |
| CT-052 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Confirmar sem texto e só com espaços: "Informe a providência adotada.", e o alerta continua aberto. | passou | `CT-052-1.png` a `CT-052-3.png` |  |
| CT-053 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | "Alerta reconhecido", situação Em atendimento, "Administrador · 20:18" e a providência. | passou | `CT-053.png` |  |
| CT-054 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Duas sessões com o mesmo alerta e confirmação quase simultânea: a primeira aceita; a segunda recebe "Este alerta já foi reconhecido por Administrador às 20:18. A sua providência não foi gravada." | passou | `CT-054-1.png`, `CT-054-2.png` |  |
| CT-056 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | 2026-11-0001 com categoria, gravidade, órgão, descrição, ponto no mapa e endereço, bairro Ronda calculado; 2026-11-0003 na zona rural: "sem bairro · zona rural, distrito Itaiacoca", gravada sem bairro. | passou | `CT-056-1.png` a `CT-056-4.png`; `2026-11-12-rodada-2/CT-056-CT-061.txt` |  |
| CT-059 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Vazio: "Escolha a categoria." e "Escolha a gravidade."; sem ponto: "Marque a localização no mapa."; ponto fora: "A coordenada está fora do município de Ponta Grossa."; sem órgão e sem descrição, registrada (2026-11-0003). | passou | `CT-059-1.png` a `CT-059-4.png` |  |
| CT-060 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | "Abrir" num alerta sem ocorrência abre o formulário "A partir do alerta…" preenchido; 2026-11-0004 registrada com origem "Alerta de EA-02"; depois disso, o botão do alerta passa a "Abrir a ocorrência vinculada" e não cria outra. | passou | `CT-060-1.png` a `CT-060-5.png` |  |
| CT-061 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Registro no log de atividades (`registro_ocorrencia`, 20:23:48); o painel aberto em outra aba mostrou a ocorrência no mapa sem recarregar. | passou | `CT-061.png`; `2026-11-12-rodada-2/CT-056-CT-061.txt` |  |
| CT-069 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Duração −1: recusada no formulário ("Não pode ser negativa…"); 0: aceita, e o alerta abriu no mesmo segundo da primeira leitura fora do limite (SN-027, 20:12:29). | passou | `CT-069-1.png`, `CT-069-2.png` |  |
| CT-070 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Leituras com horário retroativo no SN-901, regra de 10 min: t0, t0 + 5 min e t0 + 9 min 59 s sem alerta; t0 + 10 min 00 s abriu o alerta "Nível do arroio acima da cota". | passou | `CT-070.png`; `2026-11-12-rodada-2/CT-070.txt` |  |
| CT-071 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Regra de teste de 0 min no SN-901, publicação pelo `mosquitto_pub`: com > 3,5, 3,5 não dispara e 3,51 dispara; com ≥ 3,5, 3,49 não dispara e 3,5 dispara; nas duas, a leitura normal encerrou o alerta. | passou | `2026-11-12-rodada-2/CT-071.txt` |  |
| CT-082 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Relatórios (US16), filtros e caixas de busca (US08) e Exportar (US25) visíveis, desabilitados e com o título "Previsto: USnn, backlog" em todas as telas. | passou | `CT-082.png`; `2026-11-12-rodada-2/CT-082.txt` |  |
| CT-083 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Marca "simulado" nos dispositivos do simulador na lista de dispositivos, no balão do mapa e nos alertas que vêm deles. | passou | `CT-083-1.png`, `CT-083-2.png` |  |
| CT-084 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Colunas protocolo, gravidade, ocorrência, localização, órgão, situação e tempo em aberto; abertas antes da em atendimento; Encerradas com "Encerrada em". | passou | `CT-084-1.png` a `CT-084-3.png` |  |
| CT-085 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Histórico da 2026-11-0004 em ordem: alerta gerado (valor e limite), alerta reconhecido (providência e autor), ocorrência registrada e as providências. | passou | `CT-085.png` |  |
| CT-086 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Providência vazia: "Escreva a providência."; a primeira passa a Em atendimento, com o responsável; a segunda mantém a situação. | passou | `CT-086-1.png` a `CT-086-3.png`; `2026-11-12-rodada-2/CT-086-CT-089.txt` |  |
| CT-087 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Encerrar sem texto: "Escreva a observação de encerramento."; com observação, encerrada às 20:27, "sem novas atualizações", e o alerta em atendimento vinculado foi encerrado junto. | passou | `CT-087-1.png`, `CT-087-2.png`; `2026-11-12-rodada-2/CT-086-CT-089.txt` |  |
| CT-088 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | A encerrada saiu de Em andamento e do mapa, aparece em Encerradas e abre o detalhe. | passou | `CT-088-1.png` a `CT-088-3.png` |  |
| CT-089 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | A segunda sessão (Gestor do Meio Ambiente, outra aba) recebeu a mudança para em atendimento e o encerramento sem recarregar; log com as duas atualizações e o encerramento. | passou | `CT-089-1.png`, `CT-089-2.png`; `2026-11-12-rodada-2/CT-086-CT-089.txt` |  |
| CT-090 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | "Dispositivo sem comunicação" com a marca "regra do sistema", em cinza; o clique não abre edição. | passou | `CT-090.png` |  |
| CT-095 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | /rios aberta pelo indicador do painel: por arroio, nível, tendência da última hora, série de 6 h, vazão do Open-Meteo de hoje e cota da menor regra ativa; sensor inativo sem nível e com vazão. | passou | `CT-095-1.png`, `CT-095-2.png` |  |
| CT-096 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Com /rios aberta, leitura de nível do SN-027: o cartão mudou 0,36 s depois, sem recarregar. | passou | `CT-096.png` |  |
| CT-099 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Painel do alerta de risco de enchente: nível de SN-014 com limite e "com chuva de 55,1 mm em EA-02 (limite 50 mm)". | passou | `CT-099.png` |  |
| CT-100 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Grandeza bloqueada na regra de enchente; chuva −5 e janela vazia recusadas; 50 → 60 mm salvo e no histórico; com 60, nível 3,51 e chuva de 55 mm no bairro não dispararam; de volta a 50, dispararam (CT-107). | passou | `CT-100-1.png` a `CT-100-4.png`; `2026-11-12-rodada-2/CT-100-disparo.txt` |  |
| CT-107 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Cota 3,5 e 55 mm de chuva em Ronda: nível 3,50 sem alerta e cartão sem marca; 3,51 abriu "Risco de enchente" (composição com a chuva da EA-901), e o cartão ficou vermelho com "Alerta grave". | passou | `CT-107-1.png` a `CT-107-4.png`; `2026-11-12-rodada-2/CT-107.txt` |  |
| CT-108 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Nível dos rios, Fluxo de veículos, Qualidade do ar (IQAr), Iluminação pública, Ruído urbano e Vagas públicas, na ordem do protótipo. | passou | `CT-108.png` |  |
| CT-109 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Valor, unidade, nota e variação ("+1,92 m/h" nos rios, único com leitura de uma hora antes); com alerta grave, rios em vermelho; com atenção, Qualidade do ar só com a barra âmbar. | passou | `CT-109-1.png`, `CT-109-2.png` |  |
| CT-111 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | "Ocorrências abertas hoje" com o acumulado por hora e a média; "por bairro" com os bairros das 24 h. O eixo vertical rotula a linha do meio com valor arredondado: com 3 ocorrências mostra 0, 2, 3, e com 1 mostra 0, 1, 1. | falhou | `CT-111-1.png` a `CT-111-3.png` | INC-006 |
| CT-112 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Com o painel aberto, leituras de vagas e de nível: Vagas e Nível dos rios mudaram sem recarregar (rios cerca de 5 s depois). | passou | `CT-112-1.png` a `CT-112-3.png`; `2026-11-12-rodada-2/CT-112.txt` |  |
| CT-114 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Protocolo, parte de endereço ("Cavalcanti"), bairro ("Ronda") e código ("SN-901") trazem os resultados correspondentes; "%%%" responde "Nada encontrado". | passou | `CT-114-1.png` a `CT-114-5.png` |  |
| CT-115 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Grupos Ocorrências e Dispositivos; setas movem o destaque; Enter abriu a ocorrência; Esc fechou a lista; o dispositivo abriu no painel de edição. | passou | `CT-115-1.png` a `CT-115-5.png` |  |
| CT-117 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | "ab" e "  ab  ": "Digite pelo menos 3 caracteres."; "abc" busca. | passou | `CT-117-1.png` a `CT-117-3.png` |  |
| CT-118 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | E-mail de outro domínio e repetido recusados com mensagem; senha provisória mostrada uma vez e válida; órgão e perfil editados; usuário inativado continua na lista, não entra, e a sessão aberta dele caiu; nova senha invalida a anterior; o administrador não inativa nem muda o próprio perfil. | passou | `CT-118-1.png` a `CT-118-13.png` |  |
| CT-119 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Consulta: Reconhecer, Abrir e Registrar ocorrência desabilitados; Operador: cadastrar regra e dispositivo desabilitados ("Seu perfil não permite esta ação."); Gestor: cadastrar regra habilitado; aba Usuários apagada para os três, e /usuarios volta ao painel. | passou | `CT-119-1.png` a `CT-119-6.png` |  |
| CT-120 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Operador da Defesa Civil vê a ocorrência da Mobilidade com "Só Mobilidade atualiza esta ocorrência." e sem caixa de providência; registra providência na da Defesa Civil; a ocorrência sem órgão tem a caixa; o administrador atualizou e encerrou uma da Defesa Civil. | passou | `CT-120-1.png` a `CT-120-4.png` |  |
| CT-126 | 12/11 | `v1.0.2-sprint-6` | automação de terminal | Coleta real contra a fonte, com o limite original de 55: Air Quality API sem erro às 20:41:07; PM2.5 dos 16 bairros gravado, sem hora futura e sem duplicar; nenhum alerta de bairro. | passou | `2026-11-12-rodada-2/CT-126.txt` |  |
| CT-127 | 12/11 | `v1.0.2-sprint-6` | automação de navegador e terminal | Pré-condição alterada: limite 5 e reinício da interface de programação, 16 alertas. Na lista, "Open-Meteo" no lugar do dispositivo e o bairro; no painel do alerta, fonte "Open-Meteo Air Quality API" e o bairro, sem dispositivo. No mapa, o alerta não aparece. | falhou | `CT-127-1.png` a `CT-127-4.png`; `2026-11-12-rodada-2/CT-127-CT-128-preparacao.txt` | INC-008 |
| CT-128 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Alerta de poluição: formulário com Qualidade do ar, Meio Ambiente e a nota "Sugerido para alertas de poluição; pode trocar."; 2026-11-0005 vinculada. Alerta de nível: categoria e órgão sem sugestão. Limite devolvido a 55 às 20:44. | passou | `CT-128-1.png` a `CT-128-4.png` |  |
| CT-129 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | SN-027: 24 h em médias de 5 min; 7 e 30 dias em médias por hora com a faixa mínimo–máximo; troca de grandeza na EA-03. | passou | `CT-129-1.png` a `CT-129-4.png` |  |
| CT-130 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | EA-03 PM2.5: linha tracejada de 55 µg/m³ e legenda; na EA-02, só a regra ativa de temperatura aparece, e a desativada "Temperatura alta" não. | passou | `CT-130-1.png`, `CT-130-2.png` |  |
| CT-131 | 12/11 | `v1.0.2-sprint-6` | automação de navegador | Coluna "Últimas 3 h" com nove barras de 20 min no SN-027; "–" nas câmeras e semáforos, sem leitura. | passou | `CT-131-1.png`, `CT-131-2.png` |  |

**Observações fora das fichas**, encontradas durante a rodada 2. Nenhuma muda o resultado esperado
de um caso, e por isso não foram abertas como incidente sem decisão (seção 5.4 do relatório):

- Na tabela de regras e na de usuários, o nome fica centralizado quando quebra em duas linhas (é um
  botão sem alinhamento à esquerda).
- No seletor de perfil do formulário de usuário, o texto "Administrador" passa da borda do botão
  (`2026-11-12-rodada-2/observacao-perfil-administrador.png`).
- Na lista de dispositivos, a última leitura do controlador de iluminação aparece como "1 pontos", e
  o cabeçalho "Últimas 3 h" quebra o "h" para a segunda linha.
- No formulário de dispositivo, as mensagens de validação continuam na tela depois de o campo ser
  corrigido, até o próximo envio.
- "Detalhes" de um alerta aberto abre o mesmo painel de "Reconhecer".

## Registro do CT-005 — ensaio seguindo só o README

Executado em 02/11/2026, das 21:09 às 21:12, por Bryan Charles, autor do README. Por isso não há
independência (DT08). O caso continua valendo para verificar que o ambiente sobe só com o Docker.

**Pré-condição atendida parcialmente.** A ficha pede máquina sem Node e sem PostgreSQL.
Conferência feita em 02/11/2026:

- **PostgreSQL: não instalado.** Não há `psql`, `postgres`, `pg_ctl`, `pg_config`, `initdb` nem
  `pg_dump` no `PATH`. Também não há fórmula `postgresql`, `libpq` ou `postgis` nem cask no
  Homebrew, serviço do Homebrew, Postgres.app, `/Library/PostgreSQL`, agente do launchd ou
  processo do PostgreSQL fora do Docker.
- **Node: instalado.** Node 24.1.0, com `npm` e `npx`, pela fórmula `node` do Homebrew, em
  `/opt/homebrew/bin`.

Nenhum passo do README seguido no ensaio usou o Node ou o PostgreSQL da máquina. O banco rodou no
contêiner `db`, e a aplicação foi compilada dentro das imagens. O Newman, que roda com o Node, é da
rodada automatizada, não do CT-005. A segunda restrição está registrada no DT08.

Ambiente: macOS 15.7 (arm64), Docker 28.1.1, Compose 2.35.1, Docker Desktop aberto antes do
primeiro comando, como o README pede. A máquina não era limpa para o Docker: as imagens base e o
cache de construção já existiam, então o tempo de subida não representa uma primeira subida. O
ambiente de desenvolvimento foi parado antes, com `docker compose down`, sem `-v`.

| Passo do README | Comando que o README mandou executar | O que aconteceu | Informação que faltou no README |
|---|---|---|---|
| Como executar, 1 | `git clone https://github.com/Sivwen0741/projeto-smart-city.git` e `cd projeto-smart-city` | Pela pré-condição do caso, o clone foi da tag: `git clone --branch v1.0-sprint-6`, numa pasta separada. Clone sem alteração, no commit `01ecf29`. | Nenhuma para quem executa a `main`. |
| Como executar, 2 | `cp .env.example .env`; trocar a senha do banco, o `JWT_SEGREDO` e a senha do administrador; `openssl rand -hex 32` para gerar os valores | Os três valores foram gerados com o `openssl`. O `.env` é ignorado pelo git, e nenhum arquivo versionado mudou. | Nenhuma. |
| Como executar, 3 | `docker compose up --build`, ou `docker compose up --build -d` | O README avisa que o nome do projeto é fixo (`scoc`) e que qualquer cópia na mesma máquina usa o mesmo banco. Para senha que não bate, a única saída que ele dá é `docker compose down -v`, que apagaria o banco da cópia de desenvolvimento. Para não tocar nesse banco, os comandos rodaram com `-p teste-sprint-6`, opção que o README não traz. Subida em 1 min 16 s (21:10:23 a 21:11:39). `db`, `mosquitto` e `api` ficaram saudáveis; `simulador` e `web` ficaram em execução, porque não têm verificação de saúde no Compose. Todas as linhas de log que o README cita apareceram: 13 migrações, território com 5 distritos e 16 bairros, administrador criado, 14 dispositivos, 7 regras, ingestão assinando o tópico e simulador com 11 dispositivos a cada 30 s. | Como subir uma segunda cópia isolada na mesma máquina, com outro nome de projeto (INC-001). |
| Como executar, 4 | Abrir <http://localhost:8080> e entrar com o `ADMIN_EMAIL` e a `ADMIN_SENHA` do `.env` | A interface web respondeu 200, com o título "Centro Integrado de Operações Urbanas". Health em `/api/health` respondeu 200 com PostGIS 3.4.3, e o Swagger em `/api/docs` respondeu 200. A tela de login e o painel não foram vistos no navegador. A interface de programação listou os 14 dispositivos de exemplo. | Nenhuma. |
| Usar a interface de programação, 1 | `curl -X POST http://localhost:3000/api/auth/login ...` com o administrador do `.env` | Devolveu o token, com validade de 8 h, e o usuário com perfil administrador. | Nenhuma. |

Encontrado na leitura, fora do caminho de execução: a seção "Situação" do README ainda diz que a
Sprint 4 é a primeira sprint de implementação e manda ao replanejamento da Sprint 4 para os itens
em andamento (INC-002).

Resultado: o ambiente subiu e o login do administrador funcionou seguindo o README. Isso dependeu
de uma informação que o README não dá, a opção `-p`, necessária só porque a máquina já tinha outra
cópia do projeto. Do painel, foi conferido que a interface web respondeu e que a interface de
programação listou os 14 dispositivos de exemplo. A conferência do painel aberto na tela, com os
dispositivos de exemplo no mapa, fica pendente para o registro de quem executa o caso pela tela.
