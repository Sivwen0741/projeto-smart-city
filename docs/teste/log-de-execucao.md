# Log de execução — Sprint 6

Seção 3 da documentação de teste. Versão sob teste: tag `v1.0-sprint-6` (commit `01ecf29`), num
clone da tag numa pasta separada do repositório de trabalho, sem nenhum arquivo alterado além do
`.env` criado a partir do `.env.example`. As evidências ficam em [`evidencias/`](evidencias/),
com a convenção do [README](evidencias/README.md) da pasta.

## Rodadas

| Rodada | Data e hora (BRT) | O quê | Total | Aprovados | Falhas | Evidência |
|---|---|---|---|---|---|---|
| 1 | 02/11/2026 21:09 a 21:12 | CT-005: ensaio seguindo só o README | 1 caso | ver registro abaixo | 0 | registro abaixo |
| 1 | 02/11/2026 21:13:10 a 21:13:39 | Smoke test da seção 1.3 (CT-001, CT-006, CT-026, CT-040, CT-056), parte automatizável, contra o ambiente no ar | 5 casos | 5 | 0 | `rodada-1-smoke.txt` |
| 1 | 02/11/2026 21:13:50 a 21:14:12 | Suíte de unidade, com cobertura | 53 testes em 4 suítes | 53 | 0 | `rodada-1-unidade.txt` |
| 1 | 02/11/2026 21:14:17 a 21:15:40 | Suíte de integração e sistema, em série (`--runInBand`), banco de teste recriado | 216 testes em 20 suítes | 216 | 0 | `rodada-1-integracao.txt` |
| 1 | 02/11/2026 21:15:47 a 21:15:55 | Coleção do Postman pelo Newman 6.2.1, contra o ambiente no ar | 74 requisições, 133 verificações | 133 | 0 | `rodada-1-newman.txt` |

Cobertura da suíte de unidade: 98,3% das instruções, 81,44% dos desvios, 95,91% das funções e
98,79% das linhas.

Todos os comandos do Compose usaram `-p teste-sprint-6`. O nome do projeto é fixo (`scoc`) no
`docker-compose.yml`, e sem essa opção o clone dividiria o banco com a cópia de desenvolvimento da
mesma máquina (INC-001).

## Casos

Linhas dos casos executados na rodada 1. Nos casos "automatizado e manual", a parte da tela fica
pendente até a execução manual. Os casos só manuais ainda não executados (CT-004, CT-038, CT-039,
CT-043, CT-082 e CT-107) entram quando forem executados.

| ID | Data | Versão | Executado por | Resultado | Evidência | Incidente |
|---|---|---|---|---|---|---|
| CT-001 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente; smoke passou | `tt01.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-smoke.txt` |  |
| CT-002 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt01.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-003 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt01.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-005 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles, autor do README (DT08) | subida e login passaram; painel na tela não conferido (registro abaixo) | Registro do CT-005, abaixo | INC-001, INC-002 |
| CT-006 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente; smoke passou | `us20.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-smoke.txt` |  |
| CT-007 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us20.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-008 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us20.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-009 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us20.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-010 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us20.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-011 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us20.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-012 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us20.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-013 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-014 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-015 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-016 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-017 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-018 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-019 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-020 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us23.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-021 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us23.e2e-spec.ts`, `regra.spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-022 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us23.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-023 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us23.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-024 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us23.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-025 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us23.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-026 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou; smoke passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-smoke.txt` |  |
| CT-027 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-028 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-029 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-030 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-031 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-032 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-033 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us22.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-034 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us01.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-035 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us01.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-036 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us01.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-037 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us01.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-040 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente; smoke passou | `us02.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-smoke.txt` |  |
| CT-041 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-042 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-044 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us03.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-045 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us03.e2e-spec.ts`, `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-046 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us03.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-047 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us03.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-048 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us28.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-049 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us28.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-050 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us28.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-051 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us28.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-052 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-053 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-054 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-055 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-056 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente; smoke passou | `us05.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-smoke.txt` |  |
| CT-057 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us05.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-058 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us05.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-059 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us05.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-060 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us05.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-061 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us05.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-062 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-063 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-064 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-065 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-066 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-067 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-068 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-069 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us23.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-070 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-071 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `regra.spec.ts` · `rodada-1-unidade.txt` |  |
| CT-072 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-073 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-074 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us04.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-075 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us28.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-076 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us28.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-077 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us28.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-078 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts`, `comunicacao.spec.ts`, `us22.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-079 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us22.e2e-spec.ts`, `comunicacao.spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-080 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts`, `comunicacao.spec.ts`, `us22.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-081 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `tt02.e2e-spec.ts`, `us01.e2e-spec.ts`, `comunicacao.spec.ts`, `us22.e2e-spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-083 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `tt02.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-084 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-085 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-086 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-087 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-088 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-089 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-090 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us07.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-091 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us07.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-092 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us07.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-093 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us07.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-094 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us09.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-095 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us09.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-096 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us09.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-097 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us09.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-098 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-099 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-100 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-101 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-102 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-103 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-104 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-105 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-106 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us10.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-108 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us12.e2e-spec.ts`, `indicadores.spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-109 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us12.e2e-spec.ts`, `indicadores.spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-110 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us12.e2e-spec.ts`, `indicadores.spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-111 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us12.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-112 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us12.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-113 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us12.e2e-spec.ts`, `iqar.spec.ts` · `rodada-1-integracao.txt`, `rodada-1-unidade.txt` |  |
| CT-114 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us26.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-115 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us26.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-116 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us26.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-117 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us26.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-118 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-119 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-120 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-121 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-122 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-123 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-124 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-125 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us21.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-126 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us18.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-127 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us18.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-128 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us18.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-129 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us19.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-130 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us19.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-131 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | parte automatizada passou; tela pendente | `us19.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-132 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us19.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-133 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-134 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-135 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-136 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-137 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-138 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |
| CT-139 | 02/11/2026 | `v1.0-sprint-6` | Bryan Charles | passou | `us06.e2e-spec.ts` · `rodada-1-integracao.txt` |  |

## Registro do CT-005 — ensaio seguindo só o README

Executado em 02/11/2026, das 21:09 às 21:12, por Bryan Charles, autor do README. Por isso não há
independência (DT08). O caso continua valendo para verificar que o ambiente sobe só com o Docker,
sem Node nem PostgreSQL. Esta máquina não tem PostgreSQL instalado, mas tem Node 24, e nenhum passo
do README o usou. O Newman, que roda com Node, é da rodada automatizada, não do CT-005.

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
