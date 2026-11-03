# Relatórios de incidente — Sprint 6

Seção 4 da documentação de teste. Versão sob teste: tag `v1.0-sprint-6` (commit `01ecf29`).
Severidade conforme o plano. Alta: impede uma função do núcleo, expõe dado ou quebra o controle
de acesso. Média: a função falha, mas há contorno, ou falha um item do escopo estendido. Baixa:
texto, aparência ou incômodo sem efeito no resultado.

## Resumo

| ID | Resumo | Caso | Severidade | Prioridade | Status |
|---|---|---|---|---|---|
| INC-001 | O README não informa como subir uma segunda cópia isolada na mesma máquina, e a saída que ele dá (`docker compose down -v`) apaga o banco da outra cópia | CT-005 | baixa | média | aberto |
| INC-002 | A seção "Situação" do README está desatualizada: diz que a Sprint 4 é a sprint em andamento | CT-005 | baixa | baixa | aberto |

## INC-001 — README sem forma de isolar uma segunda cópia do projeto

| Campo | Valor |
|---|---|
| Data e quem registrou | 02/11/2026, Bryan Charles |
| Item testado e versão | TT01 (ambiente com Docker Compose) e README, `v1.0-sprint-6` |
| Caso de teste relacionado | CT-005 |
| Passos para reproduzir | 1. Ter na máquina uma cópia do projeto já criada pelo Compose (volume `scoc_dados-banco`). 2. Clonar o repositório em outra pasta. 3. Seguir a seção "Como executar" do README, passos 1 a 3. |
| O que aconteceu | O `docker-compose.yml` fixa `name: scoc`, então a segunda cópia usa o mesmo projeto e o mesmo volume de banco da primeira, como o próprio README avisa. Se a senha do `.env` novo não bate com a do banco existente, o README manda rodar `docker compose down -v`, que apaga o banco da primeira cópia. O README não diz como subir a cópia com outro nome de projeto. No ensaio, foi preciso usar `docker compose -p teste-sprint-6`, informação de fora do README. |
| O que era esperado | Que o README permitisse subir uma segunda cópia isolada sem apagar a primeira, por exemplo indicando `docker compose -p <nome>` ou `COMPOSE_PROJECT_NAME`. A seção 1.4 do plano conta com isso: o ensaio em máquina limpa usa outro nome de projeto e outras portas. Numa máquina realmente limpa, sem outra cópia, o problema não aparece. |
| Ambiente | macOS 15.7 (arm64), Docker 28.1.1, Compose 2.35.1; clone da tag numa pasta separada; cópia de desenvolvimento parada, com o volume preservado. |
| Severidade e prioridade | Baixa: a subida funciona numa máquina limpa. Média: afeta todo integrante que executar os casos manuais numa máquina que já tenha a cópia de desenvolvimento. |
| Status e responsável | Aberto. Correção no repositório de trabalho, não no clone da versão sob teste. |

## INC-002 — Seção "Situação" do README desatualizada

| Campo | Valor |
|---|---|
| Data e quem registrou | 02/11/2026, Bryan Charles |
| Item testado e versão | README, `v1.0-sprint-6` |
| Caso de teste relacionado | CT-005 (encontrado na leitura do README, fora do caminho de execução) |
| Passos para reproduzir | Abrir o `README.md` da tag e ler a seção "Situação". |
| O que aconteceu | O texto diz "A Sprint 4 é a primeira sprint de implementação. Os itens em andamento e seus critérios de aceite estão em `docs/Sprint_4_Replanejamento.pdf`." |
| O que era esperado | Que a seção descrevesse a versão entregue, a Sprint 6, e apontasse para os critérios e verificações das Sprints 5 e 6, que já estão na tabela de documentação do próprio README. |
| Ambiente | Leitura do arquivo; não depende do ambiente. |
| Severidade e prioridade | Baixa: texto, sem efeito na execução. Baixa. |
| Status e responsável | Aberto. Correção no repositório de trabalho, não no clone da versão sob teste. |
