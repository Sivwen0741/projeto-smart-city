# Relatórios de incidente — Sprint 6

Seção 4 da documentação de teste. Versão sob teste: tag `v1.0-sprint-6` (commit `01ecf29`).
Severidade conforme o plano. Alta: impede uma função do núcleo, expõe dado ou quebra o controle
de acesso. Média: a função falha, mas há contorno, ou falha um item do escopo estendido. Baixa:
texto, aparência ou incômodo sem efeito no resultado.

## Resumo

| ID | Resumo | Caso | Severidade | Prioridade | Status |
|---|---|---|---|---|---|
| INC-001 | O README não informa como subir uma segunda cópia isolada na mesma máquina, e a saída que ele dá (`docker compose down -v`) apaga o banco da outra cópia | CT-005 | baixa | média | fechado |
| INC-002 | A seção "Situação" do README está desatualizada: diz que a Sprint 4 é a sprint em andamento | CT-005 | baixa | baixa | fechado |
| INC-003 | O teste US02-3 conta todos os dispositivos sem comunicação do banco, e não só os que ele cria, o que o torna não determinístico mesmo com o banco recriado | CT-042 | baixa | alta | fechado |
| INC-004 | Gráfico histórico fora de escala: rótulos dos eixos com cerca de 40 px e gráfico com mais de 1200 px de altura; não cabe sem rolagem na resolução de teste | CT-129 | baixa | média | fechado |
| INC-005 | Campo "Instalado em" do formulário de dispositivo mostra a data em formato americano (03/14/2024) | CT-013 | baixa | baixa | aberto |

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
| Correção | Commit `0c48fd4` (branch `sprint-6-inc-001`, PR #27, mesclado na `main` em `2074e46`). O `docker-compose.yml` passou a `name: ${COMPOSE_PROJECT_NAME:-scoc}`: sem a variável, o nome continua `scoc`, e o comando do README não muda. O `.env.example` traz o `COMPOSE_PROJECT_NAME` comentado. O README explica como subir a segunda cópia com o `COMPOSE_PROJECT_NAME` e as quatro portas no `.env`, e avisa que o `down -v` vale para o projeto do `.env`. Teste automatizado: não se aplica, porque o nome do projeto é configuração do Compose, fora do alcance das suítes, que rodam dentro dos contêineres. |
| Reteste | 02/11/2026, 21:25 a 21:28, pelo CT-005, na versão `0c48fd4`, por Bryan Charles. Clone novo da branch, seguindo só o README corrigido, sem `-p`, com a cópia de desenvolvimento e o ambiente da versão sob teste presentes na máquina. A segunda instância subiu como projeto `scoc-teste`, com volumes próprios, nas portas 8180, 3100, 1983 e 5532. Interface, health e login do administrador responderam. Os volumes das outras cópias não mudaram, e o ambiente da versão sob teste ficou de pé o tempo todo. O `docker compose down -v` do README removeu só os volumes de `scoc-teste`. Regressão na versão corrigida: unidade 53/53 e integração 216/216. **Passou.** Evidência: `evidencias/2026-11-02-reteste-INC-001/`. |
| Status e responsável | Fechado em 02/11/2026, depois do reteste. Bryan Charles. |

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
| Correção | Commit `1a64496` (branch `sprint-6-inc-002`, PR #28, mesclado na `main` em `b8f76b8`). A seção "Situação" agora descreve a Sprint 6 como sprint em andamento: a tag `v1.0-sprint-6` (commit `01ecf29`, corte de 31/10/2026), os itens entregues, a US17 e a US27 no backlog da Sprint 7, a documentação de teste em `docs/teste/` e a regra das correções depois do corte. Teste automatizado: não se aplica, porque é texto. |
| Reteste | 02/11/2026, 21:30 a 21:33, pelo CT-005, na versão `1a64496`, por Bryan Charles. Clone novo da branch, que já tinha a correção do INC-001. A seção "Situação" não cita mais a Sprint 4 como sprint em andamento, e os oito links dela apontam para arquivos que existem. O ambiente subiu isolado pelo `.env`, e a interface, o health e o login responderam. **Passou.** Na regressão, a unidade deu 53/53. A integração deu 215/216 na 1ª execução, com falha no US02-3, e 216/216 na 2ª, as duas com o banco recriado. A falha não envolve o README, único arquivo alterado, e foi registrada como INC-003. Evidência: `evidencias/2026-11-02-reteste-INC-002/`. |
| Status e responsável | Fechado em 02/11/2026, depois do reteste. Bryan Charles. |

## INC-003 — US02-3 não determinístico na contagem de dispositivos sem comunicação

| Campo | Valor |
|---|---|
| Data e quem registrou | 02/11/2026, Bryan Charles |
| Item testado e versão | Suíte de integração, `us02.e2e-spec.ts`, na versão `1a64496` (correção do INC-002), mesmo código de teste da `v1.0-sprint-6` |
| Caso de teste relacionado | CT-042 (indicadores do topo da tela de alertas, critério US02-3) |
| Passos para reproduzir | 1. Recriar o banco de teste: `docker compose --profile teste rm -sf db-teste`. 2. Rodar a suíte em série: `docker compose --profile teste run --rm --build api-teste`. 3. Repetir; a falha não aparece em toda execução. |
| O que aconteceu | Na regressão do reteste do INC-002, a 1ª execução deu 215/216: `US02-3 os dispositivos sem comunicação são contados por tipo` falhou em `us02.e2e-spec.ts:153`, com o esperado 1 e o recebido 2 na diferença do total de dispositivos sem comunicação. A 2ª execução, de novo com o banco recriado e as suítes na mesma ordem, deu 216/216. O teste lia o resumo antes e depois de inserir uma câmera e comparava a contagem de todos os dispositivos do banco. Um dispositivo criado por outra suíte que cruzasse o limite de comunicação entre as duas leituras entrava na diferença. |
| O que era esperado | Que o teste desse o mesmo resultado em toda execução com o banco recriado, contando só os dispositivos que ele mesmo cria. O comportamento do sistema estava correto nas duas execuções: o resumo contou corretamente os dispositivos sem comunicação de cada momento. |
| Relação com o DT07 | Não é um ponto conhecido do DT07. O DT07 descreve acoplamento por dados de rodadas anteriores, com o banco reaproveitado. Esta falha ocorreu com o banco recriado: é uma dependência de tempo dentro da mesma rodada. |
| Ambiente | macOS 15.7 (arm64), Docker 28.1.1, Compose 2.35.1; clone da branch `sprint-6-inc-002` com `COMPOSE_PROJECT_NAME=scoc-teste`; banco de teste em `tmpfs`, recriado antes de cada execução. |
| Severidade e prioridade | Baixa: não há defeito no produto. Alta: o critério de conclusão do plano exige a suíte verde num banco recriado na versão final, e um teste não determinístico torna esse critério não verificável. |
| Correção | Commit `6439f63` (branch `sprint-6-inc-003`, PR #29, mesclado na `main` em `757b68e`). O resumo só devolve contagens por tipo, então o teste cria um tipo de dispositivo próprio, com nome único, e três dispositivos desse tipo: um que nunca se comunicou, um com a última comunicação há 2 h e um com comunicação agora. Ele confere a situação de cada dispositivo pelo identificador em `GET /api/dispositivos`, confere que o resumo conta 2 sem comunicação nesse tipo e que o total é a soma dos tipos, e apaga no fim o tipo e os dispositivos. Só o teste mudou. |
| Reteste | 02/11/2026, 21:42 a 21:46, na versão `6439f63`, por Bryan Charles. Clone novo da branch; três execuções seguidas da suíte de integração, com o banco recriado antes de cada uma: 216/216, 216/216 e 216/216. **Passou.** Evidência: `evidencias/2026-11-02-reteste-INC-003/`. |
| Status e responsável | Fechado em 02/11/2026, depois do reteste. Bryan Charles. |

## INC-004 — Gráfico histórico fora de escala

| Campo | Valor |
|---|---|
| Data e quem registrou | 02/11/2026, Bryan Charles, por inspeção das telas |
| Item testado e versão | US19 (gráfico histórico), `v1.0-sprint-6`, no clone da tag |
| Caso de teste relacionado | CT-129 (a correção também é retestada pelo CT-130) |
| Passos para reproduzir | 1. Abrir <http://localhost:8080> numa janela de 1456 × 817 e entrar com o administrador. 2. Dispositivos › SN-014 › Ver histórico. 3. Período 24 h. |
| O que aconteceu | Os rótulos dos eixos aparecem com cerca de 40 px, e o gráfico passa de 1200 px de altura. Foi preciso rolar duas vezes para ver o eixo do tempo. |
| O que era esperado | O gráfico inteiro, com o eixo do tempo e a legenda dos limites, cabendo sem rolagem na resolução de teste do plano (1440 × 900, seção 1.4). |
| Ambiente | Clone da tag `v1.0-sprint-6` em http://localhost:8080; Google Chrome numa janela de 1456 × 817. |
| Severidade e prioridade | Baixa: não há perda de função. Média: o gráfico não cabe na tela na resolução em que o sistema é testado. |
| Causa | O `GraficoLinha` desenhava num `viewBox` de 400 unidades de largura e ocupava 100% da largura do contêiner, com altura automática. O SVG inteiro, fonte e altura juntas, escalava na proporção da largura da área do gráfico dividida por 400. Na tela de histórico, que é larga, a fonte de legenda de 11 px chegava perto dos 40 px observados, e a altura crescia na mesma proporção. |
| Correção | Commit `a73fdd9` (branch `sprint-6-inc-004`, PR #30, mesclado na `main` em `686ed19`). O `GraficoLinha` aceita a largura em pixels, e o `viewBox` acompanha o contêiner (escala 1). A tela de histórico mede a área do gráfico com `ResizeObserver` e desenha com 320 px de altura. Painel e Rios mantêm o comportamento anterior. Teste automatizado: não se aplica, porque a interface web não tem executor de teste (DT05). |
| Reteste | 02/11/2026, 21:52 a 21:58, na versão `a73fdd9`, por Bryan Charles, numa instância separada da versão corrigida, com o Chrome em 1440 × 900. CT-129 (SN-014, 24 h): gráfico com 320 px de altura, eixos em 11 px, e a seção com o eixo do tempo e a legenda termina a 634 px do topo, sem rolagem. CT-130 (PM2.5 da EA-03): linha tracejada de 55 µg/m³ com o rótulo e a legenda, sem rolagem. Regressão: unidade 53/53, integração 216/216. **Passou.** Evidência: `evidencias/2026-11-02-reteste-INC-004/` (`CT-129.png`, `CT-130.png`, `reteste.txt`). |
| Status e responsável | Fechado em 02/11/2026, depois do reteste. Bryan Charles. |

## INC-005 — Data de instalação em formato americano

| Campo | Valor |
|---|---|
| Data e quem registrou | 02/11/2026, Bryan Charles, por inspeção das telas |
| Item testado e versão | US22 (cadastro de dispositivo), `v1.0-sprint-6`, no clone da tag |
| Caso de teste relacionado | CT-013 |
| Passos para reproduzir | 1. Abrir <http://localhost:8080> num Chrome com o idioma em inglês e entrar com o administrador. 2. Dispositivos › abrir um dispositivo com data de instalação, ou Cadastrar dispositivo. 3. Ver o campo "Instalado em". |
| O que aconteceu | O campo mostra 03/14/2024, no formato mês/dia/ano. É um `input type="date"` nativo, e o navegador da máquina está em inglês. |
| O que era esperado | Data em dd/mm/aaaa, como no resto do sistema, inclusive no cabeçalho e nas colunas das listas. |
| Ambiente | Clone da tag `v1.0-sprint-6` em http://localhost:8080; Google Chrome com o idioma em inglês. |
| Severidade e prioridade | Baixa. Baixa. |
| Investigação | O documento já declara `lang="pt-BR"` (`web/index.html`) desde a primeira versão, e o campo continua em mês/dia/ano. O Chrome formata o `input type="date"` pelo idioma da interface do navegador, não pelo `lang` da página. A única correção na aplicação é trocar o campo nativo por um componente próprio de data. |
| Decisão | Não corrigir nesta entrega (decisão de 02/11/2026). A duas semanas da entrega, trocar um componente de formulário traz risco maior que o defeito. O incidente fica aberto e entra nos riscos residuais (seção 5.4 do relatório de conclusão). |
| Status e responsável | Aberto. Bryan Charles. |
