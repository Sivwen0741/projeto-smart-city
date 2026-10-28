# Plano de teste — Smart City Operations Center

Plano de teste da Sprint 6, segundo a ISO/IEC/IEEE 29119-3, com a adaptação pedida na disciplina.
Ele alimenta as seções 1 e 6 do modelo de documentação de teste. A especificação dos casos está em
[`casos-de-teste.md`](casos-de-teste.md).

## Identificação

| Campo | Valor |
|---|---|
| Equipe | [número da equipe] · Bryan Charles, Guilherme Eidam, Guilherme Sartori, Taynah Cruz |
| Sistema | Smart City Operations Center (SCOC): central de operações urbanas da Prefeitura de Ponta Grossa. Recebe as leituras dos dispositivos da cidade por MQTT e de fontes públicas, dispara alertas por regras configuráveis, mostra tudo em mapa e painel em tempo real e registra as ocorrências até a resolução. |
| Tecnologias | TypeScript · NestJS 11 (Node 24) · React com Vite · Leaflet sobre OpenStreetMap · PostgreSQL 16 com PostGIS 3.4 · Socket.IO · Mosquitto (MQTT) · Swagger · Docker Compose |

## 1. Plano de teste

### 1.1 Contexto e escopo

**Versão testada.** A `main` no fim do dia 31/10/2026, identificada pelo commit e pela tag
`v1.0-sprint-6`, criada no corte. Nenhuma funcionalidade entra depois do corte. Depois dele, a
`main` só recebe correção de incidente registrado e teste automatizado.

**Situação do escopo em 27/10/2026, a fechar no corte.** O núcleo obrigatório e todos os itens do
escopo estendido abaixo estão na `main`: os PRs #16 a #24 da Sprint 6 foram mesclados em 27/10,
sem revisão de outro integrante, como registrado no DT06. Em 01/11 esta seção é conferida com o
`git log` da tag do corte; item que sair até lá passa para "fora do escopo", com os seus casos.

**Núcleo obrigatório** (Sprints 1 a 5, prioridade alta no backlog revisado da Sprint 4):

| Item | Módulo | Critérios |
|---|---|---|
| TT01 Ambiente com Docker Compose | infraestrutura, migrações, carga territorial | 5 |
| US20 Autenticação | `auth`, `log-atividade` | 7 |
| US22 Dispositivos | `dispositivos`, consulta espacial | 7 |
| US23 Regras de alerta | `regras-alerta` | 6 |
| TT02 Ingestão e motor de alertas | `ingestao`, `alertas` (motor), simulador | 8 |
| US01 Mapa | `MapaCidade`, `dispositivos`, `ocorrencias` | 6 |
| US02 Lista de alertas | `alertas` | 4 |
| US03 Tempo real | `tempo-real` (Socket.IO) | 4 |
| US28 Alerta grave persistente | `alertas`, faixa da tela | 4 |
| US04 Reconhecimento de alerta | `alertas` | 4 |
| US05 Ocorrência manual | `ocorrencias` | 6 |

**Escopo estendido** (Sprint 6, entra o que estiver na `main` no corte de 31/10/2026):

| Item | Módulo | Critérios | Na `main` |
|---|---|---|---|
| TT02-9 Dados do simulador identificados | `ingestao`, telas | 1 | sim |
| US06 Atualizar ocorrência até a resolução | `ocorrencias` | 6 | 27/10, PR #16 |
| US07 Aviso de dispositivo sem comunicação | `alertas` (rotina) | 4 | 27/10, PR #17 |
| US09 Nível e vazão dos rios | `rios`, coleta Open-Meteo Flood | 4 | 27/10, PR #18 |
| US10 Alerta de risco de enchente | `alertas` (motor) | 3 | 27/10, PR #19 |
| US12 Painel com indicadores | `painel`, `qualidade-ar` (IQAr) | 5 | 27/10, PR #20 |
| US26 Busca do cabeçalho | `busca` | 3 | 27/10, PR #21 |
| US21 Usuários e perfis por órgão | `usuarios`, `auth` (permissões) | 4 | 27/10, PR #22 |
| US18 Alerta de poluição por bairro | `qualidade-ar`, `alertas` | 3 | 27/10, PR #23 |
| US19 Gráfico histórico | `dispositivos` (histórico) | 4 | 27/10, PR #24 |

**Fora do escopo, e por quê:**

- **US17 (qualidade do ar por região) e US27 (camadas do mapa):** não ficaram prontas até o corte.
  Vão para o backlog da Sprint 7 como não entregues. A coleta de qualidade do ar por bairro (critério
  US17-1) entrou com a US18 e é testada nela; a camada do mapa (US17-2 e US17-3) não existe.
- **Item da Sprint 6 que não entrar na `main` até o corte:** vai para o backlog da Sprint 7, como
  não entregue.
- **Histórias de prioridade baixa do backlog de evolução** (US08, US11, US13, US14, US15, US16,
  US24 e US25): o Documento de Visão e o replanejamento da Sprint 4 as deixam sem compromisso para o
  semestre. Os elementos de tela delas aparecem desabilitados com a marca "backlog", e o caso de
  teste verifica só que continuam desabilitados.
- **O que o Documento de Visão exclui da plataforma**, como vídeo das câmeras, comando remoto de
  semáforos, aplicativo móvel e implantação em produção real.
- **TomTom Traffic:** citado no README como fonte do fluxo de veículos, mas não integrado; o fluxo
  vem do simulador.

### 1.2 Riscos

Riscos da seção 3.5 do replanejamento da Sprint 4, com a situação em 27/10/2026, e os que
apareceram depois.

| Risco | Tipo | Grau | Efeito no teste | Tratamento |
|---|---|---|---|---|
| Concentração do desenvolvimento em um integrante (3.5) | projeto | Alto | Quem escreveu o código também escreveu os testes e fez as verificações de tela; defeito de entendimento passa pelos dois. | Os 64 casos com parte manual são divididos entre os quatro integrantes por tela (`distribuicao-manual.md`), e o ensaio em máquina limpa é de quem não escreveu o README; a ação AM04 (transferir os testes para o responsável por qualidade) segue aberta. |
| Limite diário de requisições das fontes externas (3.5) | produto | Médio | Uma rodada de teste contra a fonte real pode esgotar a cota e falhar por motivo externo. | Testes automatizados com respostas simuladas do Open-Meteo; coleta real a cada 60 min e numa requisição só para os 16 bairros; a verificação manual contra a fonte real é feita uma vez por rodada. |
| Primeira sprint de implementação depois de dois meses só de documentação (3.5) | projeto | Encerrado | — | Superado: a velocidade foi medida nas Sprints 4 e 5. |
| DT05: sem automação de interface | produto | Alto | Os critérios de tela (mapa, faixa grave, formulários, botões por perfil) só têm verificação manual, que não se repete a cada mudança. | Casos de tela marcados como manuais, com passos e evidência por captura; regressão de tela no fim da execução, depois das correções. |
| DT06: sem revisão cruzada | projeto | Alto | Nenhum item teve leitura de código por outro integrante, e os PRs da Sprint 6 foram mesclados sem revisão em 27/10; o teste é a única barreira. | Execução dos casos manuais por outros integrantes (distribuição em `distribuicao-manual.md`); o DT06 segue registrado. |
| DT07: suítes acopladas pela ordem de execução | produto | Médio | Com o banco de teste reaproveitado, duas suítes falham por dados de rodadas anteriores (US12-ruído e US10-3), o que pode ser lido como regressão. | Toda rodada oficial recria o banco de teste antes de rodar; falha intermitente é comparada primeiro com o DT07, antes de virar incidente. |
| Escopo ainda em revisão no corte | projeto | Médio | Item sem merge até 31/10 sai do escopo e os casos dele deixam de valer. | Corte rígido em 31/10; esta seção e os casos são conferidos com a `main` em 01/11. |
| Verificação de tela em navegador fora da máquina do ambiente | projeto | Baixo | Em 27/10, o navegador disponível para a verificação assistida não alcançava o `localhost` da máquina do ambiente. | Execução manual no Chrome da própria máquina que sobe o ambiente. |

### 1.3 Estratégia

| Nível | Tipo | Técnicas | Ferramenta |
|---|---|---|---|
| Unidade | Funcional | Particionamento de equivalência, valor limite e cobertura de instruções | Jest 30 com ts-jest, cobertura pelo `--coverage` do Jest |
| Integração | Funcional | Particionamento de equivalência e tabela de decisão; roda contra PostgreSQL 16 com PostGIS 3.4 e Mosquitto reais, em contêiner, sem simulação de banco | Jest 30, ts-jest, Supertest e `@nestjs/testing`, no serviço `api-teste` do Docker Compose |
| Sistema | Funcional e não funcional | Tabela de decisão e transição de estados | Newman (coleção `docs/postman/scoc.postman_collection.json`) para a interface de programação; verificação manual pela tela, porque não há automação de interface (DT05) |
| Aceitação | Funcional | Critérios de aceite das próprias histórias (`Sprint_4_Replanejamento.pdf` 3.3, `sprint-5-criterios.md`, `sprint-6-criterios.md`) | Casos deste plano, executados pelos mesmos meios dos níveis anteriores e conferidos item a item |

**Ferramentas confirmadas no repositório (27/10/2026).** O executor é o Jest 30.5, com ts-jest 29,
Supertest 7 e `@nestjs/testing` 11. Há duas configurações:

- **Unidade:** `api/test/jest-unidade.json`, 4 suítes e 53 casos em `api/test/unidade/`, sem banco,
  com cobertura medida sobre as funções puras: IQAr e faixas (`qualidade-ar/iqar.ts`), operador da
  regra de alerta (`alertas/regra.ts`), limiar de sem comunicação (`dispositivos/comunicacao.ts`) e
  cálculo dos indicadores do painel (`painel/indicadores.ts`). Em 27/10: 98,3% das instruções,
  81,4% dos desvios, 95,9% das funções e 98,8% das linhas.
- **Integração e sistema pela interface de programação:** `api/test/jest-e2e.json`, rodada em série
  (`--runInBand`), 20 suítes e 216 casos em `api/test/*.e2e-spec.ts`, cada um com o número do
  critério no nome.

O limiar de sem comunicação é executado pelo banco, em SQL, porque também ordena, filtra e alimenta
a rotina da US07; a função em TypeScript é a referência testada na unidade, e um caso de integração
da US22 confere que o banco e a referência dão o mesmo resultado para todos os dispositivos. A
interface web não tem executor de teste, só a verificação de tipos (`tsc -b`). A coleção do
Postman tem 74 requisições e 133 verificações, das Sprints 4 a 6, e passou pelo Newman em 27/10
(`docs/postman/evidencia-2026-10-27-sprint-6.md`).

**Onde cada técnica se aplica:**

| Técnica | Onde | Por quê |
|---|---|---|
| Tabela de decisão | Disparo pelas regras de alerta (US23 com TT02) e risco de enchente (US10) | O alerta depende da combinação de regra ativa, grandeza, valor fora do limite, duração cumprida, situação do dispositivo e alerta já ativo; o risco de enchente combina nível acima da cota com chuva no bairro ou vazão prevista. |
| Transição de estados | Ciclo do alerta (aberto, em atendimento, encerrado) e da ocorrência (aberta, em atendimento, encerrada) | Cada evento (reconhecer, normalizar, registrar providência, encerrar) só vale a partir de certos estados, e as transições proibidas precisam ser recusadas. |
| Valor limite | Cota do rio, duração mínima da regra, faixas do IQAr e os três caracteres da busca | São fronteiras numéricas onde o erro de comparação (maior contra maior ou igual) aparece. |
| Particionamento de equivalência | Situação do dispositivo (operando, sem comunicação, manutenção, inativo) e perfis de acesso (consulta, operador, gestor, administrador) | Cada classe tem comportamento próprio, e um caso por classe basta. |
| Cobertura de instruções | Funções puras: IQAr e faixas, operador da regra de alerta, limiar de sem comunicação e indicadores do painel | Medida pelo `--coverage` do Jest na suíte de unidade; o número entra nas métricas do relatório de conclusão. |

**Smoke test.** Antes de cada rodada: o ambiente sobe com `docker compose up` (CT-001); o login
do administrador funciona (CT-006); uma leitura publicada no MQTT aparece gravada (CT-026); a lista
de alertas abre (CT-040); uma ocorrência é registrada (CT-056). Se algum falhar, a rodada não começa.

**Reteste.** Cada incidente corrigido é retestado pelo caso que o encontrou, na versão da correção,
e só então fecha. A correção vai numa branch própria, com o número do incidente na mensagem, e
ganha teste automatizado quando o caso é automatizável.

**Regressão.** Depois de cada correção, a suíte automatizada inteira roda num banco de teste
recriado. No fim da execução, os casos manuais de prioridade alta são repetidos na versão final.

### 1.4 Dados e ambiente

**Ambiente de teste.**

- **Sistema completo:** `docker compose up` numa máquina limpa, sem Node nem PostgreSQL instalados,
  sobe banco PostGIS, Mosquitto, interface de programação, interface web e simulador. O `.env` sai do
  `.env.example`. As migrações versionadas criam o esquema e a carga inicial roda na subida.
- **Testes automatizados:** perfil `teste` do Compose, com banco PostGIS em memória (`db-teste`, em
  `tmpfs`) e broker próprio (`mosquitto-teste`). O banco é recriado antes de cada rodada oficial:

  ```bash
  docker compose --profile teste rm -sf db-teste
  docker compose --profile teste run --rm --build api-teste
  ```

- **Isolamento:** o ensaio em máquina limpa usa outro nome de projeto do Compose e outras portas,
  para não dividir o banco com o ambiente de desenvolvimento.

**Dados de teste.**

- **Usuários:** o administrador inicial vem do `ADMIN_EMAIL` e da `ADMIN_SENHA` do `.env`. Os
  usuários dos outros perfis são cadastrados por ele na tela de usuários (US21). Os testes
  automatizados criam os próprios usuários com e-mail aleatório no domínio funcional.
- **Território:** 5 distritos (IBGE) e 16 bairros (OpenStreetMap), versionados em
  `api/src/database/seeds/territorio/` com atribuição ODbL.
- **Dispositivos de exemplo:** 14, de todos os tipos, nos bairros oficiais; 11 deles recebem
  leituras do simulador.
- **Regras de exemplo:** 7 regras simples, a regra de sistema de sem comunicação (US07) e a regra de
  risco de enchente (US10).
- **Simulador:** publica pelo MQTT as leituras dos exemplos, com episódios periódicos fora do
  limite (chuva, nível, material particulado, iluminação), gravadas com origem `simulador`.
- **Fontes externas:** Open-Meteo Flood API (vazão) e Air Quality API (PM2.5 e PM10 por bairro), sem
  chave, a cada 60 min. Nos testes automatizados as respostas são simuladas.

**Navegadores e dispositivos.** Google Chrome atual em computador, na resolução do protótipo
(1440 × 900), na mesma máquina que sobe o ambiente. Não há versão móvel no escopo.

### 1.5 Critérios

**Conclusão.** O teste termina quando todos os itens abaixo forem atendidos:

1. Todos os casos de prioridade alta aprovados.
2. Nenhum incidente de severidade alta em aberto.
3. Suíte automatizada verde num banco de teste recriado, na versão final.
4. Cada história do núcleo coberta por ao menos um caso executado.

**Suspensão.** A execução para quando:

1. o ambiente não sobe numa máquina limpa; ou
2. um defeito bloqueante impede a execução de mais de um terço dos casos planejados.

**Retomada.** Depois da correção, o smoke test roda inteiro; aprovado, a execução volta do caso em
que parou e os casos afetados pela correção são repetidos.

## Formato dos registros da execução

Estrutura das seções 3 e 4 do modelo, preenchidas no checkpoint 2. O modelo pede pouco nas duas, e
a aula pede mais; o documento traz as duas formas, sem escolher uma.

**3. Log de execução.** Primeiro, o que o modelo pede: onde ficam as evidências. Elas ficam em
`docs/teste/evidencias/`, uma pasta por rodada (`AAAA-MM-DD-rodada-N/`), com a saída da suíte
automatizada, a saída do Newman e uma captura de tela por caso manual, nomeada pelo identificador
do caso (`CT-034.png`). Abaixo, a tabela por caso que a aula pede (p. 12 e 14):

| Caso | Data | Versão (tag ou commit) | Quem executou | Resultado obtido | Situação | Evidência | Incidente |
|---|---|---|---|---|---|---|---|
| CT-___ | dd/mm | `v1.0-sprint-6` | | | passou, falhou ou bloqueado | arquivo ou nome do teste | INC-___ |

**4. Relatórios de incidente.** Primeiro, a tabela-resumo do modelo:

| ID | Resumo | Caso | Severidade | Prioridade | Status |
|---|---|---|---|---|---|
| INC-___ | | CT-___ | alta, média ou baixa | alta, média ou baixa | aberto, em correção, retestado ou fechado |

Abaixo dela, uma ficha por incidente, com os campos da aula (p. 15):

| Campo | Valor |
|---|---|
| Identificador | INC-___ |
| Data e quem registrou | |
| Item testado e versão | história e tag ou commit |
| Caso de teste relacionado | CT-___ |
| Passos para reproduzir | |
| Resultado esperado × obtido | |
| Severidade e prioridade | |
| Status e responsável | |

**Severidade.** Alta: impede uma função do núcleo, expõe dado ou quebra o controle de acesso.
Média: a função falha, mas há contorno, ou falha um item do escopo estendido. Baixa: texto,
aparência ou incômodo sem efeito no resultado.

## Equipe e papéis

| Integrante | Atribuição no projeto | Papel no teste |
|---|---|---|
| Bryan Charles | Desenvolvimento backend e frontend | Projeta os casos, corrige os defeitos e reexecuta |
| Guilherme Sartori | Testes e qualidade | Executa os casos manuais e registra os incidentes |
| Guilherme Eidam | Documentação | Organiza as evidências e monta o documento |
| Taynah Cruz | Gerência de projeto | Acompanha o cronograma e os critérios de conclusão e suspensão |

Os papéis seguem as atribuições do replanejamento da Sprint 4. Os casos com parte manual são
executados pelos quatro, pela divisão por tela em [`distribuicao-manual.md`](distribuicao-manual.md);
o registro dos incidentes fica com o responsável por qualidade.

## Cronograma

| Data | Atividade | Saída |
|---|---|---|
| 27/10 (terça) | Aula da Sprint 6; início do plano | Este plano e a especificação dos casos, em rascunho |
| 27/10 | Merge da Sprint 6 na `main`; suíte de unidade com cobertura; coleção do Postman com as rotas da Sprint 6 | `main` com o escopo estendido |
| 28 a 31/10 | Correções que aparecerem antes do corte; corte em 31/10 | Tag `v1.0-sprint-6` na `main` |
| 01 e 02/11 | Escopo congelado e conferido com a tag; divisão dos casos manuais entre os integrantes | Plano e casos finais |
| 03/11 (terça) | Checkpoint 1 | Plano de teste e casos especificados |
| 04 a 07/11 | Execução: suíte automatizada em banco recriado, suíte de unidade com cobertura, Newman, casos manuais pela tela | Log de execução e evidências |
| 06 a 09/11 | Registro de incidentes, correção, reteste e regressão | Relatórios de incidente |
| 10/11 (terça) | Checkpoint 2 | Testes executados, com log, evidências e incidentes |
| 11 a 15/11 | Regressão final, métricas e relatório de conclusão; documento no formato do modelo | Documento em PDF |
| 16/11 (segunda), 23h59 | Entrega final | Modelo de documentação de teste preenchido |
| 17 e 19/11 | Seminário final | Apresentação |

## 6. Testes automatizados

| Campo | Valor |
|---|---|
| Ferramenta | Jest 30 com ts-jest, Supertest e `@nestjs/testing`; Newman para a coleção do Postman |
| Local no repositório | `api/test/unidade/` (unidade), `api/test/*.e2e-spec.ts` (integração e sistema pela interface de programação), `docs/postman/` (coleção) |
| Como executar | Unidade, com cobertura: `docker compose --profile teste run --rm --no-deps --build api-teste npm run test:unidade`. Integração: `docker compose --profile teste rm -sf db-teste` e depois `docker compose --profile teste run --rm --build api-teste`. Coleção: `npx newman run docs/postman/scoc.postman_collection.json --env-var "senha=<ADMIN_SENHA>"` |
| Última execução | 27/10/2026, `main` mais a suíte de unidade (PR #26): 53 de unidade e 216 de integração, todos aprovados, banco recriado; cobertura da unidade de 98,3% das instruções e 81,4% dos desvios; coleção com 74 requisições e 133 verificações sem falha. O clone limpo da `main` depois do merge da Sprint 6 subiu e passou nos 215 testes de então. A execução oficial é sobre a tag do corte, no log de execução. |
