# Log de execução — Sprint 6

Seção 3 da documentação de teste. Versão sob teste: tag `v1.0-sprint-6` (commit `01ecf29`), num
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

Linhas dos casos executados na rodada 1. Situação segue o plano: passou, falhou ou bloqueado.
Caso com parte ainda não executada fica "pendente", valor que o plano não prevê: nos casos
"automatizado e manual", a parte da tela fica pendente até a execução manual. Os casos só manuais ainda não executados (CT-004, CT-038, CT-039,
CT-043, CT-082 e CT-107) entram quando forem executados.

| Caso | Data | Versão (tag ou commit) | Quem executou | Resultado obtido | Situação | Evidência | Incidente |
|---|---|---|---|---|---|---|---|
| CT-001 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Smoke: parte automatizável passou contra o ambiente no ar. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `tt01.e2e-spec.ts`; `2026-11-02-rodada-1/smoke.txt` |  |
| CT-002 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt01.e2e-spec.ts` |  |
| CT-003 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `tt01.e2e-spec.ts` |  |
| CT-005 | 02/11 | `v1.0-sprint-6` | Bryan Charles, autor do README (DT08) | Ambiente subiu e login do administrador funcionou seguindo o README, com `-p` de fora dele (INC-001); painel na tela não conferido. Pré-condição atendida parcialmente: máquina com Node 24.1.0 (Homebrew) e sem PostgreSQL; nenhum passo do README usou o Node (registro abaixo). | pendente (tela) | Registro do CT-005, abaixo | INC-001, INC-002 |
| CT-005 (reteste do INC-001) | 02/11 | `0c48fd4` | Bryan Charles, autor do README (DT08) | Segunda instância subiu isolada sem `-p`, com `COMPOSE_PROJECT_NAME` e portas no `.env`, como o README corrigido manda; outras cópias intactas; `down -v` removeu só os volumes dela; regressão 53/53 e 216/216. | passou | `2026-11-02-reteste-INC-001/reteste.txt` | INC-001 |
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
| CT-130 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us19.e2e-spec.ts` |  |
| CT-131 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Parte automatizada: os testes do caso passaram. Parte da tela: não executada. | pendente (tela) | `2026-11-02-rodada-1/integracao.txt` › `us19.e2e-spec.ts` |  |
| CT-132 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us19.e2e-spec.ts` |  |
| CT-133 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-134 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-135 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-136 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-137 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-138 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |
| CT-139 | 02/11 | `v1.0-sprint-6` | Bryan Charles | Os testes automatizados do caso passaram. | passou | `2026-11-02-rodada-1/integracao.txt` › `us06.e2e-spec.ts` |  |

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
| Como executar, 4 | Abrir <http://localhost:8080> e entrar com o `ADMIN_EMAIL` e a `ADMIN_SENHA` do `.env` | A interface web respondeu 200, com o título "Centro Integrado de Operações Urbanas". Health em `/api/health` respondeu 200 com PostGIS 3.4.3, e o Swagger em `/api/docs` respondeu 200. A tela de login e o painel não foram conferidos no navegador: a tela é da execução manual. | Nenhuma. |
| Usar a interface de programação, 1 | `curl -X POST http://localhost:3000/api/auth/login ...` com o administrador do `.env` | Devolveu o token, com validade de 8 h, e o usuário com perfil administrador. | Nenhuma. |

Encontrado na leitura, fora do caminho de execução: a seção "Situação" do README ainda diz que a
Sprint 4 é a primeira sprint de implementação e manda ao replanejamento da Sprint 4 para os itens
em andamento (INC-002).

Resultado: o ambiente subiu e o login do administrador funcionou seguindo o README. Isso dependeu
de uma informação que o README não dá, a opção `-p`, necessária só porque a máquina já tinha outra
cópia do projeto. O painel na tela fica para a execução manual.
