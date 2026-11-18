# Documentação de Teste (Sprint 6)

## Identificação

Quadro: Identificação da equipe, do sistema e das tecnologias

| Campo | Valor |
|---|---|
| Equipe | Equipe 4 — Bryan Charles, Guilherme Eidam, Guilherme Sartori, Taynah Cruz |
| Sistema | Smart City Operations Center (SCOC): central de operações urbanas da Prefeitura de Ponta Grossa. Recebe as leituras dos dispositivos da cidade por MQTT e de fontes públicas, dispara alertas por regras configuráveis, mostra tudo em mapa e painel em tempo real e registra as ocorrências até a resolução. |
| Tecnologias | TypeScript · NestJS 11 (Node 24) · React com Vite · Leaflet sobre OpenStreetMap · PostgreSQL 16 com PostGIS 3.4 · Socket.IO · Mosquitto (MQTT) · Swagger · Docker Compose |

## 1 PLANO DE TESTE

### 1.1 Contexto e escopo

**Versão testada.** A `main` no corte de 31/10/2026, commit `01ecf29`, identificada pela tag
`v1.0-sprint-6`. A `main` não recebeu commit entre 28 e 31/10; a tag foi criada sobre esse commit em
02/11. Nenhuma funcionalidade entra depois do corte. Depois dele, a `main` só recebe correção de
incidente registrado, teste automatizado e documentação. Cada correção de incidente entra na `main`
depois do corte numa branch própria, com o número do incidente na mensagem do commit. O reteste de
cada incidente roda na versão corrigida, identificada pelo commit. As correções foram reunidas em
três tags, criadas sobre a `main` depois dos retestes: `v1.0.1-sprint-6` (INC-001 a INC-003),
`v1.0.2-sprint-6` (INC-004) e `v1.0.3-sprint-6` (INC-006, INC-007 e INC-009 a INC-012), que é a
versão final. A rodada 1 foi executada na `v1.0-sprint-6`, a versão sob teste; as verificações de
tela da rodada 2 foram executadas na `v1.0.2-sprint-6` (desvio registrado na seção 5.3), e a
regressão dos casos manuais de prioridade alta, na rodada 3, na `v1.0.3-sprint-6`.

**Escopo conferido com a tag em 02/11/2026.** O núcleo obrigatório e todos os itens do escopo
estendido abaixo estão na tag: os PRs #16 a #24 da Sprint 6 foram mesclados em 27/10, sem revisão de
outro integrante, como registrado no DT06, e a suíte de unidade com a coleção do Postman entrou pelo
PR #26 na mesma noite. Nenhum item saiu do escopo na conferência.

**Núcleo obrigatório** (Sprints 1 a 5, prioridade alta no backlog revisado da Sprint 4):

Quadro: Núcleo obrigatório: itens, módulos e critérios

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

**Escopo estendido** (Sprint 6, o que estava na `main` no corte de 31/10/2026):

Quadro: Escopo estendido: itens, módulos, critérios e entrada na main

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
- **Histórias de prioridade baixa do backlog de evolução** (US08, US11, US13, US14, US15, US16,
  US24 e US25): o Documento de Visão e o replanejamento da Sprint 4 as deixam sem compromisso para o
  semestre. Os elementos de tela delas aparecem desabilitados com a marca "backlog", e o caso de
  teste verifica só que continuam desabilitados.
- **O que o Documento de Visão exclui da plataforma**, como vídeo das câmeras, comando remoto de
  semáforos, aplicativo móvel e implantação em produção real.
- **TomTom Traffic:** citado no README como fonte do fluxo de veículos, mas não integrado; o fluxo
  vem do simulador.

### 1.3 Estratégia

Quadro: Níveis, tipos, técnicas e ferramentas de teste

| Nível | Tipo | Técnicas | Ferramenta |
|---|---|---|---|
| Unidade | Funcional | Particionamento de equivalência, valor limite e cobertura de instruções | Jest 30 com ts-jest, cobertura pelo `--coverage` do Jest |
| Integração | Funcional | Particionamento de equivalência e tabela de decisão; roda contra PostgreSQL 16 com PostGIS 3.4 e Mosquitto reais, em contêiner, sem simulação de banco | Jest 30, ts-jest, Supertest e `@nestjs/testing`, no serviço `api-teste` do Docker Compose |
| Sistema | Funcional e não funcional | Tabela de decisão e transição de estados | Newman (coleção `docs/postman/scoc.postman_collection.json`) para a interface de programação; verificação manual pela tela, porque não há automação de interface (DT05) |
| Aceitação | Funcional | Critérios de aceite das próprias histórias (`Sprint_4_Replanejamento.pdf` 3.3, `sprint-5-criterios.md`, `sprint-6-criterios.md`) | Casos deste plano, executados pelos mesmos meios dos níveis anteriores e conferidos item a item |

**Ferramentas confirmadas no repositório (versão final, `v1.0.3-sprint-6`).** O executor é o Jest
30.5, com ts-jest 29, Supertest 7 e `@nestjs/testing` 11. Há duas configurações:

- **Unidade:** `api/test/jest-unidade.json`, 5 suítes e 56 casos em `api/test/unidade/`, sem banco,
  com cobertura medida sobre as funções puras: IQAr e faixas (`qualidade-ar/iqar.ts`), operador da
  regra de alerta (`alertas/regra.ts`), limiar de sem comunicação (`dispositivos/comunicacao.ts`),
  cálculo dos indicadores do painel (`painel/indicadores.ts`) e ordenação de texto em português
  (`ordem-texto.ts`, desde a correção do INC-007). Na `v1.0.3-sprint-6`: 98,33% das instruções,
  82,17% dos desvios, 96% das funções e 98,82% das linhas.
- **Integração e sistema pela interface de programação:** `api/test/jest-e2e.json`, rodada em série
  (`--runInBand`), 20 suítes e 217 casos em `api/test/*.e2e-spec.ts`, cada um com o número do
  critério no nome.

O limiar de sem comunicação é executado pelo banco, em SQL, porque também ordena, filtra e alimenta
a rotina da US07; a função em TypeScript é a referência testada na unidade, e um caso de integração
da US22 confere que o banco e a referência dão o mesmo resultado para todos os dispositivos. A
interface web não tem executor de teste, só a verificação de tipos (`tsc -b`). A coleção do
Postman tem 74 requisições e 133 verificações, das Sprints 4 a 6, e passou pelo Newman em 27/10
(`docs/postman/evidencia-2026-10-27-sprint-6.md`) e na `v1.0.3-sprint-6` (seção 6).

**Onde cada técnica se aplica:**

Quadro: Onde cada técnica se aplica

| Técnica | Onde | Por quê |
|---|---|---|
| Tabela de decisão | Disparo pelas regras de alerta (US23 com TT02) e risco de enchente (US10) | O alerta depende da combinação de regra ativa, grandeza, valor fora do limite, duração cumprida, situação do dispositivo e alerta já ativo; o risco de enchente combina nível acima da cota com chuva no bairro ou vazão prevista. |
| Transição de estados | Ciclo do alerta (aberto, em atendimento, encerrado) e da ocorrência (aberta, em atendimento, encerrada) | Cada evento (reconhecer, normalizar, registrar providência, encerrar) só vale a partir de certos estados, e as transições proibidas precisam ser recusadas. |
| Valor limite | Cota do rio, duração mínima da regra, faixas do IQAr e os três caracteres da busca | São fronteiras numéricas onde o erro de comparação (maior contra maior ou igual) aparece. |
| Particionamento de equivalência | Situação do dispositivo (operando, sem comunicação, manutenção, inativo) e perfis de acesso (consulta, operador, gestor, administrador) | Cada classe tem comportamento próprio, e um caso por classe basta. |
| Cobertura de instruções | Funções puras: IQAr e faixas, operador da regra de alerta, limiar de sem comunicação, indicadores do painel e ordenação de texto | Medida pelo `--coverage` do Jest na suíte de unidade; o número entra nas métricas do relatório de conclusão. |

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

**Formato dos registros da execução.** Estrutura das seções 3 e 4 do modelo, preenchidas no checkpoint 2. O modelo pede pouco nas duas, e a aula pede mais; o documento traz as duas formas, sem escolher uma.

**3. Log de execução.** Primeiro, o que o modelo pede: onde ficam as evidências. Elas ficam em `docs/teste/evidencias/`, uma pasta por rodada (`AAAA-MM-DD-rodada-N/`), com a saída da suíte automatizada, a saída do Newman e uma captura de tela por caso manual, nomeada pelo identificador do caso (`CT-034.png`). O registro por caso que a aula pede (p. 12 e 14) está resumido no quadro de execução da seção 2: a situação de cada caso em cada rodada, os retestes e os incidentes. A seção 3 traz as rodadas, com data, versão e forma de execução, e o log completo por caso, com o resultado obtido e quem executou, fica no arquivo `docs/teste/log-de-execucao.md`.

**Situação.** Passou: o resultado obtido é o esperado. Falhou: o resultado obtido difere do
esperado, e o caso registra o incidente. Bloqueado: o caso não pôde ser executado por causa
externa a ele. Pendente (tela): a parte automatizada do caso passou, e a verificação de tela ainda
não foi executada. Esse último valor foi acrescentado em 02/11/2026, durante a execução (seção 5.3
do relatório de conclusão).

**4. Relatórios de incidente.** Primeiro, a tabela-resumo do modelo, com as colunas ID, Resumo, Caso, Severidade, Prioridade e Status. Abaixo dela, uma ficha por incidente, com os campos da aula (p. 15): identificador, data e quem registrou, item testado e versão, caso de teste relacionado, passos para reproduzir, resultado esperado × obtido, severidade e prioridade, status e responsável.

**Severidade.** Alta: impede uma função do núcleo, expõe dado ou quebra o controle de acesso.
Média: a função falha, mas há contorno, ou falha um item do escopo estendido. Baixa: texto,
aparência ou incômodo sem efeito no resultado.

## 2 ESPECIFICAÇÃO DE CASOS DE TESTE

Casos da seção 2 do modelo de documentação de teste, derivados do plano. Cada caso indica a história de origem e a técnica, e cita o teste automatizado que o cobre (arquivo em `api/test/` › nome do caso), o que liga esta seção à seção 6 do modelo.

A seção traz a tabela do modelo, com as sete colunas dele, e, logo depois, um quadro de execução com uma linha por caso, tirado do log: a forma de execução, a situação do caso em cada rodada, os retestes e os incidentes. As fichas individuais dos casos, com as pré-condições específicas e o nome dos testes automatizados de cada um, ficam no arquivo `docs/teste/casos-de-teste.md`; as suítes estão descritas na seção 6, e o log completo, com o resultado obtido, a evidência e quem executou, no arquivo `docs/teste/log-de-execucao.md`.

### Pré-condição comum

Versão testada: a tag do corte (`v1.0-sprint-6`); as verificações de tela da rodada 2 foram executadas na `v1.0.2-sprint-6`, a regressão da rodada 3 na `v1.0.3-sprint-6`, e os retestes nas versões corrigidas (seção 5.3). Casos com execução manual: ambiente completo no ar pelo `docker compose up` a partir de um clone da tag, com o `.env` copiado do `.env.example`, Chrome na mesma máquina e, quando o caso diz, o administrador do `.env` autenticado. Casos automatizados: suíte do perfil `teste` do Compose num banco de teste recriado (seção 1.4 do plano). As pré-condições específicas de cada caso estão na ficha do caso, no arquivo `docs/teste/casos-de-teste.md`.

### Resumo dos casos

Quadro: Resumo dos casos por escopo, prioridade e forma de execução

| | Núcleo | Estendido | Total |
|---|---|---|---|
| Casos | 82 | 57 | 139 |
| Prioridade alta | 54 | 24 | 78 |
| Só automatizado | 47 | 28 | 75 |
| Automatizado e manual (API automatizada, tela manual) | 29 | 28 | 57 |
| Só manual | 6 | 1 | 7 |

Todos os itens do escopo estendido estavam na `main` no corte de 31/10/2026; a conferência com a tag, em 02/11, não tirou nenhum caso do escopo (seção 1.1 do plano).

### Tabela de casos de teste

Mesmas colunas do modelo. Na coluna História, US e TT são a numeração do projeto (histórias de usuário e tarefas técnicas), no lugar do "HU-__" do modelo. A forma de execução e o registro da execução, que vêm da ficha de caso de teste da aula e do log e não cabem na tabela do modelo, estão no quadro de execução logo abaixo; as pré-condições específicas e os testes automatizados de cada caso, nas fichas do arquivo `docs/teste/casos-de-teste.md`.

Quadro: Especificação dos casos de teste, CT-001 a CT-139

| ID | História | Objetivo | Prioridade | Técnica | Entradas e passos | Resultado esperado |
|---|---|---|---|---|---|---|
| CT-001 | TT01 | Subir todo o ambiente com um único comando | alta | Particionamento (classe válida) | Executar `docker compose up -d`; aguardar; executar `docker compose ps`; abrir `http://localhost:8080` e `http://localhost:3000/api/health`. | Banco PostGIS, Mosquitto, interface de programação, interface web e simulador em execução e saudáveis; a tela de login abre; o health responde 200 com o banco disponível. |
| CT-002 | TT01 | Criar o esquema por migração versionada, sem comando manual | alta | Particionamento (classe válida) | Subir o banco vazio; consultar a tabela `migracao`; subir de novo. | Todas as migrações de `api/src/database/migrations/` aplicadas na primeira subida; a segunda subida não reaplica migração nem duplica a carga. |
| CT-003 | TT01 | Carregar a base territorial de Ponta Grossa | média | Particionamento (classe válida) | Consultar `distrito` e `bairro`; localizar um ponto conhecido de um bairro. | 5 distritos com o código do IBGE e 16 bairros do OpenStreetMap, cada um dentro de um distrito; a consulta espacial devolve o bairro do ponto. Desvio registrado: o IBGE não tem bairros (`2026-10-20-bairros-ibge-osm.md`). |
| CT-004 | TT01 | Versionar só o exemplo de variáveis de ambiente, sem credencial real | alta | Particionamento (classes válida e inválidas) | Executar `git ls-files \| grep -i env`; `git log --all -- .env`; buscar senha, segredo e token literais no código. | Só `.env.example` versionado; `.env` nunca entrou no histórico; nenhuma credencial real no código. |
| CT-005 | TT01 | Executar o projeto numa máquina limpa seguindo só o README, por quem não escreveu o manual | alta | Particionamento (classe válida) | Seguir a seção "Como executar" do README do início ao fim, sem ajuda. | O ambiente sobe, o login do administrador funciona e o painel abre com os dispositivos de exemplo. |
| CT-006 | US20 | Exigir e-mail funcional e senha em toda rota, exceto as públicas | alta | Particionamento (classes válida e inválidas) | Entrar pela tela com o administrador; chamar cada rota documentada sem token, com token adulterado e com token válido; abrir `/api/docs` sem token. | Com credencial válida, abre o painel; sem token ou com token adulterado, 401; com token válido, a rota responde; Swagger e health públicos, como exceção registrada. |
| CT-007 | US20 | Gravar a senha só como hash e verificar no servidor | alta | Particionamento (classe válida) | Cadastrar usuário; consultar `usuario.senha_hash`; consultar a resposta do login e do `/api/auth/eu`. | Hash argon2id no banco, nunca a senha; nenhuma resposta expõe o hash. |
| CT-008 | US20 | Responder de forma genérica à credencial inválida | alta | Particionamento (classe inválida) | Login com e-mail inexistente; login com e-mail existente e senha errada. | As duas tentativas recebem 401 com a mesma mensagem, "E-mail ou senha inválidos.". |
| CT-009 | US20 | Expirar o token em oito horas | alta | Valor limite | Emitir token e conferir a expiração; usar token vencido. | O token vale exatamente 8 h; vencido, é recusado com 401. |
| CT-010 | US20 | Impedir a autenticação do usuário inativo | alta | Particionamento (classe inválida) | Inativar um usuário; tentar login com a senha correta; usar um token emitido antes da inativação. | Login recusado com a mensagem genérica; o token anterior deixa de valer. |
| CT-011 | US20 | Atualizar o último acesso a cada login bem-sucedido | média | Particionamento (classes válida e inválidas) | Login com sucesso; login com falha; consultar `usuario.ultimo_acesso`. | O último acesso muda no sucesso e não muda na falha. |
| CT-012 | US20 | Registrar toda tentativa de acesso no log de atividades | média | Particionamento (classes válida e inválidas) | Login com sucesso, com senha errada e com e-mail inexistente; consultar `log_atividade`. | Três registros com data, hora, endereço de origem e resultado; o de e-mail inexistente sem usuário. |
| CT-013 | US22 | Cadastrar dispositivo com todos os campos | alta | Particionamento (classes válida e inválidas) | Abrir Dispositivos › Cadastrar dispositivo; preencher código, tipo, descrição, endereço, ponto no mapa, data de instalação e situação; salvar. Repetir sem código, sem tipo e com coordenada inválida. | Cadastro aceito com todos os campos devolvidos e o bairro calculado; sem código, sem tipo ou com coordenada inválida, recusado com mensagem. |
| CT-014 | US22 | Recusar código identificador repetido | alta | Particionamento (classe inválida) | Cadastrar `SN-900`; cadastrar `sn-900`; editar outro dispositivo para `SN-900`; dois cadastros simultâneos com o mesmo código. | 409 com mensagem que cita o dispositivo existente; nos simultâneos, só um é aceito. |
| CT-015 | US22 | Gravar a coordenada como geography e calcular o bairro por consulta espacial | alta | Particionamento (classes válida e inválidas) | Cadastrar dentro de um bairro, na zona rural e fora do município; tentar informar o bairro; mover o ponto. | Coluna `geography(Point,4326)`; bairro do polígono que contém o ponto, recalculado ao mover; zona rural sem bairro e com distrito; fora do município, 422; bairro informado é ignorado. |
| CT-016 | US22 | Gravar os atributos de cada tipo no campo jsonb | média | Particionamento (classes válida e inválidas) | Cadastrar um dispositivo de cada tipo com os atributos próprios; tentar atributo de outro tipo, valor inválido e obrigatório ausente; trocar o tipo. | Atributos em `atributos_especificos`; recusa com mensagem nos inválidos; troca de tipo exige atributos compatíveis. |
| CT-017 | US22 | Inativar sem excluir, mantendo o histórico de leituras | alta | Particionamento (classes válida e inválidas) | Inativar um dispositivo com leituras; consultar as leituras; tentar `DELETE`. | Registro mantido com situação inativo; leituras consultáveis; sem rota de exclusão; inexistente, 404. |
| CT-018 | US22 | Listar com as colunas do protótipo e ordenar por qualquer uma | média | Particionamento (classes válida e inválidas) | Abrir Dispositivos; clicar em cada cabeçalho duas vezes; pedir ordenação desconhecida pela API. | Código, tipo, localização, situação e última comunicação; ordem crescente e decrescente em cada coluna; ordenação desconhecida, 400. |
| CT-019 | US22 | Registrar criação, edição e inativação no log com o autor | média | Particionamento (classes válida e inválidas) | Cadastrar, editar e inativar com dois usuários diferentes; fazer uma operação recusada; consultar `log_atividade`. | Um registro por operação, com o autor e os valores anterior e novo; a recusada não gera registro. |
| CT-020 | US23 | Cadastrar regra com nome, grandeza, operador, limite, duração e gravidade | alta | Particionamento (classes válida e inválidas) | Abrir Regras › Cadastrar regra; preencher todos os campos; salvar. Pela API, testar os seis operadores, as três gravidades, grandeza desconhecida e nome vazio. | Regra salva e listada; os seis operadores e as três gravidades aceitos; grandeza desconhecida, gravidade inválida e nome vazio recusados. |
| CT-021 | US23 | Alterar o valor limite pela interface, sem mudar código | alta | Particionamento (classes válida e inválidas) | Editar o limite de uma regra para 4,2, para −1 e para 0; consultar a regra; editar regra inexistente. | O novo limite vale na hora; decimal, negativo e zero aceitos; inexistente, 404. |
| CT-022 | US23 | Ativar e desativar sem excluir, preservando os alertas | média | Particionamento (classes válida e inválidas) | Desativar e reativar uma regra que já gerou alerta; tentar `DELETE`; cadastrar regra desativada. | Regra e alertas preservados; sem rota de exclusão; regra pode nascer desativada. |
| CT-023 | US23 | Não alterar retroativamente os alertas já emitidos | alta | Particionamento (classe válida) | Disparar um alerta; mudar operador, limite e gravidade da regra; consultar o alerta. | O alerta mantém operador, limite e gravidade da época do disparo. |
| CT-024 | US23 | Impedir salvar com limite vazio, operador não escolhido ou duração negativa | alta | Particionamento (classe inválida) | No formulário, deixar o limite vazio; depois não escolher operador; depois informar duração −5; tentar salvar em cada caso. Repetir pela API, no cadastro e na edição. | Botão de salvar desabilitado com a lista do que corrigir; a API recusa com 400 e a mensagem de cada caso, sem alterar a regra. |
| CT-025 | US23 | Registrar cada alteração de regra com valor anterior e novo | média | Particionamento (classes válida e inválidas) | Cadastrar e editar uma regra; editar sem mudança; fazer edição recusada; abrir o histórico da regra. | Registro com autor, antes e depois; histórico mostra autor e valores; edição sem mudança e recusada não geram registro. |
| CT-026 | TT02 | Gravar cada leitura válida recebida pelo MQTT | alta | Particionamento (classe válida) | Publicar em `scoc/dispositivos/{código}/leituras` uma leitura de nível e uma mensagem de estação com várias grandezas. | Leituras gravadas com grandeza, valor, unidade, origem `mqtt` e horário da medição. |
| CT-027 | TT02 | Atualizar a última comunicação a cada mensagem aceita | alta | Particionamento (classes válida e inválidas) | Publicar para um dispositivo sem comunicação; publicar sinal de vida de câmera e semáforo. | O dispositivo passa a operando; câmera e semáforo atualizam a comunicação sem gravar leitura. |
| CT-028 | TT02 | Descartar mensagem inválida sem derrubar o assinante | alta | Particionamento (classe inválida) | Publicar para código inexistente, para dispositivo inativo, com grandeza que o tipo não mede e com JSON inválido; depois publicar uma leitura válida. | As inválidas são descartadas e registradas no log da aplicação; a válida seguinte é gravada. |
| CT-029 | TT02 | Avaliar a leitura contra as regras ativas da mesma grandeza | alta | Tabela de decisão | Executar as regras R1 a R7 da tabela de decisão do disparo (seção "Modelos das técnicas"). | O alerta só é emitido quando todas as condições da regra R1 são verdadeiras. |
| CT-030 | TT02 | Gravar no alerta a cópia da regra vigente no disparo | alta | Particionamento (classe válida) | Disparar um alerta com regra `>=` 300, atenção; consultar o alerta. | Alerta com regra, dispositivo, leitura, valor observado e cópia de operador, limite e gravidade. |
| CT-031 | TT02 | Não abrir outro alerta da mesma regra e dispositivo enquanto houver um ativo | alta | Tabela de decisão | Com alerta ativo, publicar mais leituras fora do limite. | Continua um único alerta ativo. |
| CT-032 | TT02 | Reconectar sozinho quando o broker cair | média | Transição de estados | Derrubar a conexão com o Mosquitto; restabelecer; publicar uma leitura. | A interface de programação reconecta sem reinício e grava a leitura. |
| CT-033 | TT02 | Subir o simulador com o Compose, publicando as leituras dos exemplos | média | Particionamento (classe válida) | Subir o ambiente; aguardar 1 min; abrir Dispositivos; consultar as últimas leituras. | Os 11 dispositivos do simulador passam a operando com leituras de origem `simulador`; a última comunicação dos exemplos só muda pela ingestão. |
| CT-034 | US01 | Mostrar os dispositivos não inativos no mapa com a cor da legenda | alta | Particionamento (classes válida e inválidas) | Abrir o painel; comparar a cor de cada marcador com a gravidade do alerta ativo e a situação do dispositivo. | Grave e atenção pela maior gravidade ativa, normal e sem comunicação; inativos fora do mapa. |
| CT-035 | US01 | Mostrar as ocorrências abertas com marcador próprio | alta | Particionamento (classes válida e inválidas) | Registrar uma ocorrência; abrir o mapa; encerrar outra ocorrência. | A ocorrência não encerrada aparece com marcador de ocorrência; a encerrada some; a lista exige token. |
| CT-036 | US01 | Mostrar o resumo ao clicar no marcador | alta | Particionamento (classe válida) | Clicar num dispositivo e numa ocorrência. | Dispositivo: código, tipo, bairro, última leitura e situação. Ocorrência: protocolo, categoria, gravidade e situação. |
| CT-037 | US01 | Desenhar limites e nomes dos bairros a partir da base territorial | média | Particionamento (classe válida) | Abrir a aba Mapa. | Os 16 bairros desenhados, cada nome dentro do próprio polígono. |
| CT-038 | US01 | Agrupar marcadores próximos com a contagem | média | Particionamento (classe válida) | Abrir o mapa no zoom inicial; aproximar sobre o Centro. | Marcadores próximos agrupados com a contagem; grave e atenção ficam fora dos grupos; o grupo se desfaz ao aproximar. |
| CT-039 | US01 | Mudar a cor dos marcadores e mostrar ocorrência nova sem recarregar | alta | Particionamento (classe válida) | Com o mapa aberto, publicar uma leitura que dispara alerta grave e registrar uma ocorrência em outra aba. | A cor do marcador e a ocorrência nova aparecem sem recarregar a página. |
| CT-040 | US02 | Listar os alertas ativos com as colunas do protótipo | alta | Particionamento (classes válida e inválidas) | Abrir Alertas; alternar entre ativos, em atendimento e encerrados hoje. | Gravidade, regra, dispositivo, bairro, medição com o limite, detecção, órgão (da ocorrência vinculada) e situação; as visões separam os conjuntos. |
| CT-041 | US02 | Ordenar por gravidade e, na mesma gravidade, do mais recente | alta | Particionamento (classes válida e inválidas) | Criar alertas informativo, atenção e grave em horários diferentes; listar. | Grave, atenção e informativo; dentro de cada gravidade, o mais recente primeiro. |
| CT-042 | US02 | Calcular os indicadores do topo da tela de alertas | média | Particionamento (classe válida) | Abrir Alertas e conferir os indicadores com os alertas existentes. | Ativos, graves sem reconhecimento, em atendimento, encerrados hoje, tempo médio até o reconhecimento, alertas em 24 h e sem comunicação por tipo. |
| CT-043 | US02 | Mostrar no painel os mesmos alertas na mesma ordem | média | Particionamento (classe válida) | Comparar o quadro "Alertas ativos" do painel com a tela de alertas. | Mesmos alertas, na mesma ordem. |
| CT-044 | US03 | Mostrar o alerta novo em até 2 segundos, sem recarregar | alta | Valor limite | Com a lista, o painel e o mapa abertos, publicar uma leitura que dispara alerta; medir o tempo até aparecer. | O alerta aparece na lista, no painel, no mapa e no contador do menu em até 2 s. |
| CT-045 | US03 | Mostrar em tempo real o reconhecimento e o encerramento feitos por outro operador | média | Particionamento (classe válida) | Duas sessões; reconhecer um alerta na primeira. | A segunda recebe a mudança de situação sem recarregar. |
| CT-046 | US03 | Exigir o token na conexão em tempo real | alta | Particionamento (classes válida e inválidas) | Conectar ao Socket.IO sem token, com token adulterado, com token de usuário inativo e com token válido. | Recusada nos três primeiros; aceita com token válido. |
| CT-047 | US03 | Reconectar sozinho sem perder alerta emitido no intervalo | média | Transição de estados | Derrubar a conexão da tela (parar a interface de programação por 10 s); disparar um alerta logo após voltar. | A tela reconecta e a lista traz o alerta emitido enquanto estava desconectada. |
| CT-048 | US28 | Encerrar sozinhos só os não graves sem reconhecimento | alta | Transição de estados | Executar as transições T4 a T6 do alerta (seção "Modelos das técnicas"); conferir na tela a saída do alerta de atenção. | Atenção e informativo sem reconhecimento encerram ao normalizar; grave nunca; reconhecido não; vale o limite copiado no disparo. |
| CT-049 | US28 | Mostrar a faixa fixa enquanto houver grave sem reconhecimento | alta | Particionamento (classes válida e inválidas) | Disparar um alerta grave; navegar por todas as telas; reconhecer o alerta. | Faixa em todas as telas autenticadas, com a quantidade e o acesso ao mais antigo, sem botão de fechar; some ao reconhecer. |
| CT-050 | US28 | Manter a faixa depois de recarregar, sair e entrar com outro usuário | média | Particionamento (classe válida) | Com grave sem reconhecimento, recarregar; sair; entrar com outro usuário. | A faixa continua, porque o estado está no servidor. |
| CT-051 | US28 | Manter o grave sem reconhecimento no topo da lista | alta | Particionamento (classe válida) | Ter um grave sem reconhecimento e um grave mais recente em atendimento; abrir Alertas. | O grave sem reconhecimento fica acima de tudo. |
| CT-052 | US04 | Exigir a providência no reconhecimento | alta | Particionamento (classe inválida) | Abrir um alerta aberto › Reconhecer; tentar confirmar sem texto e só com espaços. | Reconhecimento recusado com a mensagem pedindo a providência. |
| CT-053 | US04 | Gravar usuário, data, hora e providência, e passar a em atendimento | alta | Transição de estados | Reconhecer um alerta aberto com providência. | Alerta em atendimento com o usuário, a data e a hora e a providência. |
| CT-054 | US04 | Recusar o segundo reconhecimento, mesmo simultâneo | alta | Transição de estados | Reconhecer o mesmo alerta em duas sessões quase ao mesmo tempo; tentar reconhecer alerta encerrado e inexistente. | Só um aceito; o outro recebe a mensagem com quem reconheceu e quando; encerrado e inexistente recusados. |
| CT-055 | US04 | Registrar o reconhecimento no log de atividades | média | Particionamento (classe válida) | Reconhecer um alerta; consultar `log_atividade`. | Registro com o autor, o alerta e a providência. |
| CT-056 | US05 | Registrar ocorrência com categoria, descrição, localização, gravidade e órgão | alta | Particionamento (classes válida e inválidas) | Registrar ocorrência › preencher os campos, marcar o ponto no mapa e informar o endereço; salvar. Repetir com ponto na zona rural. | Ocorrência gravada com o bairro calculado; zona rural sem bairro; listas de categoria e órgão vêm da API. |
| CT-057 | US05 | Gerar protocolo único no formato do protótipo | alta | Particionamento (classe válida) | Registrar várias ocorrências, inclusive simultâneas. | Protocolo no formato `AAAA-MM-sequência`, sem repetição. |
| CT-058 | US05 | Gravar quem registrou, a origem telefone, a situação aberta e o primeiro histórico | alta | Particionamento (classe válida) | Registrar uma ocorrência; consultar o detalhe. | Usuário que registrou, origem "telefone", situação "aberta" e o primeiro registro do histórico. |
| CT-059 | US05 | Recusar o cadastro sem categoria, gravidade ou localização, ou fora do município | alta | Particionamento (classe inválida) | Tentar salvar sem categoria, sem gravidade, sem ponto e com ponto fora do município; salvar sem órgão e sem descrição. | Recusado com mensagem nos quatro primeiros; órgão e descrição são opcionais. |
| CT-060 | US05 | Abrir ocorrência a partir de um alerta, que fica vinculado | média | Particionamento (classes válida e inválidas) | Em Alertas, "Abrir" num alerta sem ocorrência; salvar; tentar de novo no mesmo alerta e num inexistente. | Alerta vinculado e origem "alerta"; alerta já vinculado ou inexistente não abre outra. |
| CT-061 | US05 | Registrar no log e mostrar a ocorrência no mapa em tempo real | média | Particionamento (classe válida) | Com o mapa aberto em outra aba, registrar uma ocorrência; consultar `log_atividade`. | Entrada no log; a ocorrência aparece no mapa sem recarregar. |
| CT-062 | TT02 | Regra R1 do disparo: todas as condições verdadeiras abrem o alerta | alta | Tabela de decisão | Regra ativa, mesma grandeza, leitura 600, duração zero, sensor ativo, sem alerta ativo. | Alerta aberto na primeira leitura. |
| CT-063 | US23 | Regra R2 do disparo: regra desativada não dispara | alta | Tabela de decisão | Igual a R1, com a regra desativada. | Nenhum alerta. |
| CT-064 | US23 | Regra R3 do disparo: regra de outra grandeza não dispara | alta | Tabela de decisão | Igual a R1, com a regra sobre outra grandeza. | Nenhum alerta. |
| CT-065 | TT02 | Regra R4 do disparo: leitura dentro do limite não dispara e reinicia a duração | alta | Tabela de decisão | Regra de 10 min; leituras fora, dentro e fora do limite em sequência. | Nenhum alerta até a sequência fora do limite completar 10 min desde a leitura dentro. |
| CT-066 | TT02 | Regra R5 do disparo: duração mínima não cumprida não dispara | alta | Tabela de decisão | Regra de 10 min; leituras fora do limite em t0 e t0 + 5 min. | Nenhum alerta em t0 + 5 min. |
| CT-067 | TT02 | Regra R6 do disparo: dispositivo em manutenção grava e não dispara | alta | Tabela de decisão | Igual a R1, com o sensor em manutenção. | Leitura gravada, nenhum alerta. |
| CT-068 | TT02 | Regra R7 do disparo: alerta ativo da mesma regra e dispositivo impede outro | alta | Tabela de decisão | Igual a R1, com um alerta já ativo. | Continua um único alerta. |
| CT-069 | US23 | Duração mínima: −1 é recusada e 0 é aceita | média | Valor limite | Cadastrar regra com duração −1; depois com 0; publicar uma leitura fora do limite. | −1 recusada com "A duração mínima não pode ser negativa."; 0 aceita e dispara na primeira leitura. |
| CT-070 | TT02 | Duração mínima de 10 min: em t0 + 5 não dispara, em t0 + 10 dispara | média | Valor limite | Regra de 10 min; leituras fora do limite em t0, t0 + 5 min e t0 + 10 min. | Alerta só na leitura de t0 + 10 min. |
| CT-071 | US23 | Operador na fronteira: leitura igual ao limite | média | Valor limite | Regra `>` 3,5: publicar 3,5 e 3,51. Regra `>=` 3,5: publicar 3,49 e 3,5. Publicar pelo `mosquitto_pub` no tópico do sensor. | `>`: 3,5 não dispara, 3,51 dispara. `>=`: 3,49 não dispara, 3,5 dispara. |
| CT-072 | US04 | Alerta T1: aberto, reconhecer com providência, em atendimento | alta | Transição de estados | Reconhecer um alerta aberto. | Situação em atendimento. |
| CT-073 | US04 | Alerta T2: em atendimento, reconhecer de novo, recusado | alta | Transição de estados | Reconhecer um alerta já em atendimento. | 409 com quem reconheceu e quando; situação inalterada. |
| CT-074 | US04 | Alerta T3: encerrado, reconhecer, recusado | alta | Transição de estados | Reconhecer um alerta encerrado. | Recusado; situação inalterada. |
| CT-075 | US28 | Alerta T4: aberto não grave, leitura normal, encerrado | alta | Transição de estados | Alerta de atenção aberto; publicar leitura dentro do limite. | Situação encerrado, com data de encerramento. |
| CT-076 | US28 | Alerta T5: aberto grave, leitura normal, continua aberto | alta | Transição de estados | Alerta grave aberto; publicar leitura dentro do limite. | Situação aberto. |
| CT-077 | US28 | Alerta T6: em atendimento, leitura normal, continua em atendimento | alta | Transição de estados | Alerta reconhecido; publicar leitura dentro do limite. | Situação em atendimento. |
| CT-078 | US22 | Situação operando: comunicação dentro de duas vezes o intervalo | média | Particionamento de equivalência | Publicar uma leitura de um dispositivo com intervalo de 30 s; listar. | Situação operando. |
| CT-079 | US22 | Situação sem comunicação: além de duas vezes o intervalo, ou nunca comunicou | média | Particionamento de equivalência | Dispositivo com intervalo próprio, só com o do tipo e sem nenhum; deixar passar o limite; dispositivo novo sem leitura. | Sem comunicação depois de 2 × intervalo do dispositivo, do tipo ou, sem nenhum, de 30 min; o que nunca comunicou também. |
| CT-080 | US22 | Situação manutenção: grava a leitura e não dispara alerta | média | Particionamento de equivalência | Dispositivo em manutenção recebe leitura fora do limite. | Leitura gravada, nenhum alerta, situação manutenção. |
| CT-081 | US22 | Situação inativo: mensagem descartada e dispositivo fora do mapa | média | Particionamento de equivalência | Publicar para dispositivo inativo; consultar a lista do mapa. | Mensagem descartada e registrada no log; dispositivo marcado como inativo para o mapa deixar de fora. |
| CT-082 | US08, US16, US25 | Manter desabilitados, com a marca "backlog", os elementos das histórias de prioridade baixa | baixa | Particionamento (classe válida) | Conferir Relatórios (US16), filtros (US08), exportar (US25) e as caixas de busca das listas (US08) em todas as telas. | Visíveis, desabilitados e com a marca "backlog" no título. |
| CT-083 | TT02-9 | Identificar na tela os dados do simulador | média | Particionamento (classes válida e inválidas) | Abrir Dispositivos, o mapa e Alertas com o simulador ligado. | Leituras gravadas com origem `simulador`; dispositivos e alertas que vêm dele com a marca "simulado". |
| CT-084 | US06 | Listar as ocorrências com as colunas e as visões do protótipo | média | Particionamento (classes válida e inválidas) | Abrir Ocorrências; alternar entre Em andamento e Encerradas; pedir visão inválida pela API. | Protocolo, gravidade, categoria, bairro, órgão, situação e abertura; abertas antes das em atendimento, depois a mais grave e a mais antiga; visão inválida, 400. |
| CT-085 | US06 | Mostrar no detalhe o histórico do atendimento com os alertas | média | Particionamento (classe válida) | Abrir uma ocorrência vinda de alerta, com providências. | Histórico com a geração e o reconhecimento do alerta e os registros do atendimento, em ordem; inexistente, 404. |
| CT-086 | US06 | Registrar providência e mudar a situação | alta | Transição de estados | Executar as transições O1 a O3 da ocorrência (seção "Modelos das técnicas"); registrar providência pela tela. | Primeira providência passa a em atendimento; as seguintes mantêm; vazia ou situação inválida recusada. |
| CT-087 | US06 | Encerrar com observação obrigatória | alta | Transição de estados | Executar as transições O4 a O6 (seção "Modelos das técnicas"); encerrar pela tela. | Sem observação, recusado; encerrar grava a data e encerra só os alertas em atendimento; encerrada não aceita atualização. |
| CT-088 | US06 | Tirar a encerrada da lista em andamento e do mapa, mantendo a consulta | média | Particionamento (classe válida) | Encerrar uma ocorrência; ver a lista, o mapa e a visão Encerradas. | Sai de Em andamento e do mapa; aparece em Encerradas e abre o detalhe. |
| CT-089 | US06 | Registrar providência e encerramento no log e em tempo real | média | Particionamento (classe válida) | Duas sessões; registrar providência e encerrar na primeira; consultar `log_atividade`. | Registros no log; a segunda sessão recebe as mudanças sem recarregar. |
| CT-090 | US07 | Avisar quando um dispositivo ativo parar de enviar dados | alta | Particionamento (classes válida e inválidas) | Rotina de 60 s; dispositivo além do limite; dispositivo que nunca comunicou; dispositivo dentro do limite. | Alerta com o tempo e o limite em minutos; sem valor para quem nunca comunicou; nenhum para quem está no limite; regra de sistema visível e não editável. |
| CT-091 | US07 | Manter no máximo um alerta de sem comunicação por dispositivo | média | Tabela de decisão | Rodar a rotina várias vezes com o dispositivo parado. | Um único alerta ativo. |
| CT-092 | US07 | Encerrar o aviso quando o dispositivo voltar | média | Transição de estados | Com alerta aberto, publicar sinal de vida; repetir com alerta reconhecido. | O aberto encerra; o reconhecido continua em atendimento. |
| CT-093 | US07 | Não avisar dispositivo em manutenção ou inativo | média | Particionamento de equivalência | Deixar parados um dispositivo em manutenção e um inativo; rodar a rotina. | Nenhum alerta. |
| CT-094 | US09 | Coletar a vazão do Open-Meteo Flood API | média | Particionamento (classe válida) | Rotina de 60 min; resposta simulada com 7 dias passados, hoje e 3 de previsão; coletar duas vezes. | Vazão até hoje como leitura de origem `open-meteo` e os dias seguintes como previsão, sem duplicar; não muda a comunicação do sensor. |
| CT-095 | US09 | Mostrar cada ponto do rio com nível, tendência, série e vazão | média | Particionamento (classes válida e inválidas) | Abrir /rios pelo indicador "Nível dos rios" do painel. | Por arroio: nível atual, tendência da última hora, série de 6 h, vazão de hoje e a cota da menor regra ativa de nível; sensor inativo sem nível e com vazão. |
| CT-096 | US09 | Atualizar a tela dos rios em tempo real | média | Particionamento (classe válida) | Com /rios aberta, publicar leitura de nível. | O cartão muda sem recarregar. |
| CT-097 | US09 | Registrar a falha da fonte sem derrubar a rotina | média | Particionamento (classe inválida) | Resposta simulada com erro de rede e com HTTP 500. | Erro registrado na fonte; a rotina não lança; a última coleta boa continua valendo. |
| CT-098 | US10 | Disparar o risco de enchente pela combinação de nível e chuva ou vazão | alta | Tabela de decisão | Executar as regras E1 a E6 da tabela de decisão da enchente (seção "Modelos das técnicas"). | O alerta só abre com nível acima da cota e chuva ou vazão prevista acima do limite, no mesmo bairro e na janela. |
| CT-099 | US10 | Informar no alerta as duas leituras que o compõem | média | Particionamento (classe válida) | Disparar o risco de enchente; abrir o alerta. | Leitura de nível e de chuva (ou vazão prevista), com valores, limites e dispositivos. |
| CT-100 | US10 | Ajustar os limites da regra de enchente pela tela | média | Particionamento (classes válida e inválidas) | Editar o limite de chuva; tentar limites inválidos, troca de grandeza e campos de enchente numa regra simples. | O novo limite muda o disparo e entra no histórico; os inválidos são recusados. |
| CT-101 | US10 | Regra E1 da enchente: nível acima da cota e chuva forte no bairro, na janela, abre | alta | Tabela de decisão | Chuva de 60 mm há 2 h no bairro; nível de 3,8 m. | Alerta aberto. |
| CT-102 | US10 | Regra E2 da enchente: nível acima da cota e vazão prevista acima do limite, sem chuva, abre | alta | Tabela de decisão | Sem chuva; previsão de vazão de 20 m³/s dentro da janela; nível de 3,8 m. | Alerta aberto. |
| CT-103 | US10 | Regra E3 da enchente: só o nível acima da cota não abre | alta | Tabela de decisão | Sem chuva nem vazão prevista acima do limite; nível de 3,8 m. | Nenhum alerta. |
| CT-104 | US10 | Regra E4 da enchente: nível abaixo da cota não abre, mesmo com chuva | alta | Tabela de decisão | Chuva de 60 mm; nível de 3,0 m. | Nenhum alerta. |
| CT-105 | US10 | Regra E5 da enchente: chuva em outro bairro ou fora da janela não conta | alta | Tabela de decisão | Chuva de 60 mm em outro bairro; depois chuva no bairro há 30 h; nível de 3,8 m. | Nenhum alerta. |
| CT-106 | US10 | Regra E6 da enchente: com alerta ativo, novas leituras não abrem outro | alta | Tabela de decisão | Com o alerta de E1 ativo, novo nível de 3,9 m. | Continua um único alerta. |
| CT-107 | US09 | Cota do rio na fronteira: nível igual à cota | média | Valor limite | Publicar nível 3,5 e depois 3,51 pelo `mosquitto_pub`; abrir /rios. | 3,5 não abre o alerta nem marca "acima da cota"; 3,51 abre e marca. |
| CT-108 | US12 | Calcular os seis indicadores a partir das leituras | média | Particionamento (classes válida e inválidas) | Abrir o painel com o simulador ligado. | Nível dos rios, fluxo, qualidade do ar (IQAr), iluminação, ruído e vagas, na ordem do protótipo, calculados das leituras da última hora. |
| CT-109 | US12 | Mostrar valor, unidade, variação e nota, em vermelho com alerta ativo | média | Particionamento (classes válida e inválidas) | Disparar alerta grave de uma grandeza do painel. | Valor, unidade, variação e nota em cada indicador; com alerta grave, o indicador fica vermelho; com atenção, só a barra fica âmbar. |
| CT-110 | US12 | Mostrar "sem dados" sem leitura na última hora | média | Particionamento (classe inválida) | Sem leitura de uma grandeza na última hora. | Indicador "sem dados", sem valor. |
| CT-111 | US12 | Montar os gráficos de ocorrências a partir das ocorrências registradas | média | Particionamento (classe válida) | Registrar ocorrências hoje em bairros diferentes; abrir o painel. | "Ocorrências abertas hoje" com o acumulado por hora e a média das quatro semanas; "por bairro" com os cinco maiores das 24 h. |
| CT-112 | US12 | Atualizar o painel em tempo real | média | Particionamento (classe válida) | Com o painel aberto, publicar leitura e disparar alerta. | Os indicadores mudam sem recarregar. |
| CT-113 | US12 | Faixas do IQAr do PM2.5 nas bordas e no arredondamento | média | Valor limite | Calcular o IQAr de 0, 15, 16, 50, 51, 75, 76, 125, 126, 300 e 500 µg/m³; de 15,4, 15,5 e 16,5; classificar 40, 41, 80, 81, 120, 121, 200, 201 e 400. | Índices 0, 40, 41, 80, 81, 120, 121, 200, 201, 400 e 400; 40, 41 e 41 (x,5 vai para o par); boa, moderada, moderada, ruim, ruim, muito ruim, muito ruim, péssima e péssima. |
| CT-114 | US26 | Buscar por protocolo, endereço, bairro e código de dispositivo | média | Particionamento (classes válida e inválidas) | Digitar na caixa do cabeçalho um protocolo, parte de um endereço, um bairro e um código; pela API, `%%%` e sem token. | Resultados correspondentes; `%` e `_` tratados como texto; sem token, 401. |
| CT-115 | US26 | Agrupar os resultados e abrir o detalhe | média | Particionamento (classe válida) | Buscar um termo que traga os dois grupos; navegar com as setas e Enter; clicar num dispositivo. | Grupos Ocorrências e Dispositivos; Enter abre a ocorrência; o dispositivo abre no painel de edição; Esc fecha. |
| CT-116 | US26 | Ignorar maiúsculas e acentos | média | Particionamento (classes válida e inválidas) | Buscar "Cará-Cará", "cara-cara" e "CARÁ-CARÁ"; buscar um endereço com acento escrito sem acento. | Mesmos resultados. |
| CT-117 | US26 | Mínimo de três caracteres na busca | média | Valor limite | Digitar "ab"; "  ab  "; "abc". Pela API, `q=ab`, `q=  ab  `, sem `q` e `q=%%%`. | Com 2 caracteres, a tela pede pelo menos 3 e a API responde 400, sem contar os espaços; com 3, busca. |
| CT-118 | US21 | Cadastrar, editar e inativar usuários, sem excluir | alta | Particionamento (classes válida e inválidas) | Usuários › Cadastrar; entrar com a senha provisória; editar órgão e perfil; inativar; gerar nova senha; tentar e-mail de outro domínio e repetido. | Senha provisória mostrada uma vez e válida; inativo não entra e a sessão aberta cai; continua na lista; nova senha invalida a anterior; recusas com mensagem; o administrador não inativa nem rebaixa a si mesmo. |
| CT-119 | US21 | Recusar com 403 o que o perfil não permite | alta | Particionamento (classes válida e inválidas) | Executar os casos P1 a P4 dos perfis; entrar com cada perfil na tela. | Os quatro perfis acumulam consultar, operar, configurar e administrar; a recusa explica o motivo; na tela, botões não permitidos desabilitados e a aba Usuários apagada para quem não administra. |
| CT-120 | US21 | Ver as ocorrências de todos e atualizar só as do próprio órgão | alta | Particionamento de equivalência | Operador da Defesa Civil abre uma ocorrência da Mobilidade e uma da Defesa Civil; registra providência nas duas. | Vê as duas; na da Mobilidade, 403 e a tela mostra quem pode atualizar; na da Defesa Civil, aceita. Sem órgão, qualquer operador atualiza; o administrador atualiza qualquer uma. |
| CT-121 | US21 | Registrar no log toda alteração de usuário ou perfil | média | Particionamento (classe válida) | Cadastrar, mudar perfil e órgão, inativar, repetir a inativação e gerar nova senha; consultar `log_atividade`. | Cadastro, duas edições e nova senha, com o autor e antes e depois só dos campos alterados; a repetição sem mudança não gera registro; nenhuma senha no log. |
| CT-122 | US21 | Perfil P1, consulta: permissões nas rotas | alta | Particionamento de equivalência | Com o perfil consulta: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. | Consulta 200; operar, configurar dispositivo, configurar regra e administrar 403. |
| CT-123 | US21 | Perfil P2, operador: permissões nas rotas | alta | Particionamento de equivalência | Com o perfil operador: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. | Consulta 200; operar passa da permissão (400 da validação); configurar e administrar 403. |
| CT-124 | US21 | Perfil P3, gestor: permissões nas rotas | alta | Particionamento de equivalência | Com o perfil gestor: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. | Consulta 200; operar e configurar passam da permissão (400); administrar 403. |
| CT-125 | US21 | Perfil P4, administrador: permissões nas rotas | alta | Particionamento de equivalência | Com o perfil administrador: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. | Tudo passa da permissão: consulta e administrar 200, as escritas 400 da validação. |
| CT-126 | US18 | Aplicar as regras de PM2.5 e PM10 às leituras do Open-Meteo de cada bairro | média | Tabela de decisão | Resposta simulada da Air Quality API para os 16 bairros; regra PM2.5 `>` 6000; Centro com 5000 e 7000; depois 7000 e 5000; regra de 120 min com 3 h. | Uma requisição para todos os bairros, sem horas futuras e sem duplicar; alerta para o Centro e encerrado quando a leitura volta; a duração conta horas seguidas; falha da fonte registrada. |
| CT-127 | US18 | Indicar o bairro e a fonte no alerta | média | Particionamento (classe válida) | Disparar alerta de poluição de bairro; abrir em Alertas. | Sem dispositivo, com "Open-Meteo", o bairro e a fonte "Open-Meteo Air Quality API". |
| CT-128 | US18 | Sugerir o Meio Ambiente ao abrir ocorrência do alerta de poluição | média | Particionamento (classes válida e inválidas) | "Abrir" no alerta de poluição; depois num alerta de nível. | Poluição: órgão Meio Ambiente e categoria Qualidade do ar preenchidos, com a nota de sugestão; ocorrência vinculada. Nível: sem sugestão. |
| CT-129 | US19 | Abrir o gráfico histórico com período de 24 h, 7 dias ou 30 dias | média | Particionamento (classes válida e inválidas) | Dispositivos › um dispositivo › Ver histórico; alternar os períodos e a grandeza; pela API, período inválido e grandeza sem leitura. | 24 h em blocos de 5 min; 7 e 30 dias por hora com faixa mínimo–máximo; recusas com mensagem; dispositivo sem leitura, histórico vazio. |
| CT-130 | US19 | Mostrar a linha do limite das regras ativas | média | Particionamento (classes válida e inválidas) | Abrir o histórico de PM2.5 da EA-03. | Linha tracejada da regra ativa (55 µg/m³) e legenda; regras desativadas não aparecem. |
| CT-131 | US19 | Mostrar o minigráfico das últimas 3 h | baixa | Particionamento (classes válida e inválidas) | Abrir Dispositivos com o simulador ligado. | Coluna "Últimas 3 h" com nove barras de 20 min; "–" sem leitura. |
| CT-132 | US19 | Agregar no banco os períodos longos | média | Valor limite | Mil leituras em 30 dias; pedir o histórico de 30 dias. | No máximo um ponto por hora, somando as mil leituras; mínimo ≤ média ≤ máximo. |
| CT-133 | US06 | Ocorrência O1: aberta, primeira providência, em atendimento | alta | Transição de estados | Registrar providência sem situação. | Em atendimento. |
| CT-134 | US06 | Ocorrência O2: em atendimento, nova providência, em atendimento | alta | Transição de estados | Registrar outra providência. | Continua em atendimento e entra no histórico. |
| CT-135 | US06 | Ocorrência O3: voltar para aberta, recusado | alta | Transição de estados | Registrar providência com situação "aberta". | 400; situação inalterada. |
| CT-136 | US06 | Ocorrência O4: encerrar sem observação, recusado | alta | Transição de estados | Encerrar sem texto. | 400; continua aberta. |
| CT-137 | US06 | Ocorrência O5: aberta, encerrar com observação, encerrada | alta | Transição de estados | Encerrar direto com observação. | Encerrada, com data; alertas em atendimento encerrados. |
| CT-138 | US06 | Ocorrência O6: encerrada, nova providência, recusado | alta | Transição de estados | Registrar providência numa encerrada. | 409; continua encerrada. |
| CT-139 | US06 | Alerta T7: em atendimento, encerrar a ocorrência vinculada, encerrado | alta | Transição de estados | Encerrar a ocorrência. | Alerta encerrado; um alerta aberto vinculado continua aberto. |

Quadro: Execução dos casos por rodada, CT-001 a CT-139

| ID | Execução | Rodada 1 (v1.0) | Rodada 2 (v1.0.2) | Rodada 3 (v1.0.3) | Retestes | Incidente |
|---|---|---|---|---|---|---|
| CT-001 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-002 | automatizado | passou | — | — | — | — |
| CT-003 | automatizado | passou | — | — | — | — |
| CT-004 | manual | — | passou | passou | — | — |
| CT-005 | manual | pendente (tela) | passou | passou | passou (INC-001); passou (INC-002) | INC-001, INC-002, INC-003 |
| CT-006 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-007 | automatizado | passou | — | — | — | — |
| CT-008 | automatizado | passou | — | — | — | — |
| CT-009 | automatizado | passou | — | — | — | — |
| CT-010 | automatizado | passou | — | — | — | — |
| CT-011 | automatizado | passou | — | — | — | — |
| CT-012 | automatizado | passou | — | — | — | — |
| CT-013 | automatizado e manual | pendente (tela) | passou | passou | — | INC-005, INC-013 |
| CT-014 | automatizado | passou | — | — | — | — |
| CT-015 | automatizado | passou | — | — | — | — |
| CT-016 | automatizado | passou | — | — | — | — |
| CT-017 | automatizado | passou | — | — | — | — |
| CT-018 | automatizado e manual | pendente (tela) | falhou | — | passou (INC-007) | INC-007 |
| CT-019 | automatizado | passou | — | — | — | — |
| CT-020 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-021 | automatizado | passou | — | — | — | — |
| CT-022 | automatizado | passou | — | — | — | — |
| CT-023 | automatizado | passou | — | — | — | — |
| CT-024 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-025 | automatizado | passou | — | — | — | — |
| CT-026 | automatizado | passou | — | — | — | — |
| CT-027 | automatizado | passou | — | — | — | — |
| CT-028 | automatizado | passou | — | — | — | — |
| CT-029 | automatizado | passou | — | — | — | — |
| CT-030 | automatizado | passou | — | — | — | — |
| CT-031 | automatizado | passou | — | — | — | — |
| CT-032 | automatizado | passou | — | — | — | — |
| CT-033 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-034 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-035 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-036 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-037 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-038 | manual | — | passou | — | — | — |
| CT-039 | manual | — | passou | passou | — | — |
| CT-040 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-041 | automatizado | passou | — | — | — | — |
| CT-042 | automatizado e manual | pendente (tela) | passou | — | passou (INC-003) | INC-003 |
| CT-043 | manual | — | passou | — | — | — |
| CT-044 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-045 | automatizado | passou | — | — | — | — |
| CT-046 | automatizado | passou | — | — | — | — |
| CT-047 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-048 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-049 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-050 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-051 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-052 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-053 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-054 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-055 | automatizado | passou | — | — | — | — |
| CT-056 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-057 | automatizado | passou | — | — | — | — |
| CT-058 | automatizado | passou | — | — | — | — |
| CT-059 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-060 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-061 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-062 | automatizado | passou | — | — | — | — |
| CT-063 | automatizado | passou | — | — | — | — |
| CT-064 | automatizado | passou | — | — | — | — |
| CT-065 | automatizado | passou | — | — | — | — |
| CT-066 | automatizado | passou | — | — | — | — |
| CT-067 | automatizado | passou | — | — | — | — |
| CT-068 | automatizado | passou | — | — | — | — |
| CT-069 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-070 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-071 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-072 | automatizado | passou | — | — | — | — |
| CT-073 | automatizado | passou | — | — | — | — |
| CT-074 | automatizado | passou | — | — | — | — |
| CT-075 | automatizado | passou | — | — | — | — |
| CT-076 | automatizado | passou | — | — | — | — |
| CT-077 | automatizado | passou | — | — | — | — |
| CT-078 | automatizado | passou | — | — | — | — |
| CT-079 | automatizado | passou | — | — | — | — |
| CT-080 | automatizado | passou | — | — | — | — |
| CT-081 | automatizado | passou | — | — | — | — |
| CT-082 | manual | — | passou | — | — | — |
| CT-083 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-084 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-085 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-086 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-087 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-088 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-089 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-090 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-091 | automatizado | passou | — | — | — | — |
| CT-092 | automatizado | passou | — | — | — | — |
| CT-093 | automatizado | passou | — | — | — | — |
| CT-094 | automatizado | passou | — | — | — | — |
| CT-095 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-096 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-097 | automatizado | passou | — | — | — | — |
| CT-098 | automatizado | passou | — | — | — | — |
| CT-099 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-100 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-101 | automatizado | passou | — | — | — | — |
| CT-102 | automatizado | passou | — | — | — | — |
| CT-103 | automatizado | passou | — | — | — | — |
| CT-104 | automatizado | passou | — | — | — | — |
| CT-105 | automatizado | passou | — | — | — | — |
| CT-106 | automatizado | passou | — | — | — | — |
| CT-107 | manual | — | passou | — | — | — |
| CT-108 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-109 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-110 | automatizado | passou | — | — | — | — |
| CT-111 | automatizado e manual | pendente (tela) | falhou | — | passou (INC-006) | INC-006 |
| CT-112 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-113 | automatizado | passou | — | — | — | — |
| CT-114 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-115 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-116 | automatizado | passou | — | — | — | — |
| CT-117 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-118 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-119 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-120 | automatizado e manual | pendente (tela) | passou | passou | — | — |
| CT-121 | automatizado | passou | — | — | — | — |
| CT-122 | automatizado | passou | — | — | — | — |
| CT-123 | automatizado | passou | — | — | — | — |
| CT-124 | automatizado | passou | — | — | — | — |
| CT-125 | automatizado | passou | — | — | — | — |
| CT-126 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-127 | automatizado e manual | pendente (tela) | falhou | — | passou (INC-008, reavaliação) | INC-008 |
| CT-128 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-129 | automatizado e manual | pendente (tela) | passou | — | passou (INC-004) | INC-004 |
| CT-130 | automatizado e manual | pendente (tela) | passou | — | passou (INC-004) | INC-004 |
| CT-131 | automatizado e manual | pendente (tela) | passou | — | — | — |
| CT-132 | automatizado | passou | — | — | — | — |
| CT-133 | automatizado | passou | — | — | — | — |
| CT-134 | automatizado | passou | — | — | — | — |
| CT-135 | automatizado | passou | — | — | — | — |
| CT-136 | automatizado | passou | — | — | — | — |
| CT-137 | automatizado | passou | — | — | — | — |
| CT-138 | automatizado | passou | — | — | — | — |
| CT-139 | automatizado | passou | — | — | — | — |

**Observações das fichas.** Duas fichas têm o campo Observação, que não cabe nos quadros acima: CT-005: Nesta execução, o caso não atende ao requisito de independência: por indisponibilidade dos demais integrantes, é executado pelo próprio autor do README. Continua verificando que o ambiente sobe pelo Compose numa máquina sem Node e sem PostgreSQL, mas não a suficiência do README para um leitor novo (DT08). CT-127: Em 13/11/2026, a parte "no mapa, dentro do bairro" foi retirada do que este caso verifica: nenhum critério da US18 ou da US01 a exige, e a camada de qualidade do ar no mapa é a US17-2, fora do escopo. Foi escrita na ficha sem critério de origem. O caso verifica o critério US18-2: o alerta indica o bairro e a fonte do dado. Ver o INC-008, reclassificado como achado investigado.

### Modelos das técnicas

#### Tabela de decisão do disparo pelas regras de alerta (TT02-4, TT02-6, US23)

Quadro: Tabela de decisão do disparo pelas regras de alerta

| Condição ou ação | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
|---|---|---|---|---|---|---|---|
| Regra ativa | S | N | S | S | S | S | S |
| Mesma grandeza da leitura | S | S | N | S | S | S | S |
| Leitura fora do limite pelo operador | S | S | S | N | S | S | S |
| Duração mínima cumprida | S | S | S | – | N | S | S |
| Dispositivo ativo (não em manutenção) | S | S | S | S | S | N | S |
| Sem alerta ativo da mesma regra e dispositivo | S | S | S | S | S | S | N |
| **Abre alerta** | **sim** | não | não | não | não | não | não |
| Caso | CT-062 | CT-063 | CT-064 | CT-065 | CT-066 | CT-067 | CT-068 |

#### Tabela de decisão do risco de enchente (US10)

Quadro: Tabela de decisão do risco de enchente

| Condição ou ação | E1 | E2 | E3 | E4 | E5 | E6 |
|---|---|---|---|---|---|---|
| Nível acima da cota | S | S | S | N | S | S |
| Chuva acima do limite no mesmo bairro, dentro da janela | S | N | N | S | N (outro bairro ou fora da janela) | S |
| Vazão prevista acima do limite, dentro da janela | – | S | N | – | N | – |
| Sem alerta ativo da regra para o sensor | S | S | S | S | S | N |
| **Abre alerta** | **sim** | **sim** | não | não | não | não |
| Caso | CT-101 | CT-102 | CT-103 | CT-104 | CT-105 | CT-106 |

#### Transição de estados do alerta (US04, US28, US06)

Quadro: Transição de estados do alerta

| Estado | Evento | Próximo estado | Caso |
|---|---|---|---|
| aberto | reconhecer com providência | em atendimento | CT-072 |
| em atendimento | reconhecer | recusado, sem mudança | CT-073 |
| encerrado | reconhecer | recusado, sem mudança | CT-074 |
| aberto (atenção ou informativo) | leitura volta ao normal | encerrado | CT-075 |
| aberto (grave) | leitura volta ao normal | aberto | CT-076 |
| em atendimento | leitura volta ao normal | em atendimento | CT-077 |
| em atendimento | encerrar a ocorrência vinculada | encerrado | CT-139 (estendido) |

#### Transição de estados da ocorrência (US06, estendido)

Quadro: Transição de estados da ocorrência

| Estado | Evento | Próximo estado | Caso |
|---|---|---|---|
| aberta | primeira providência | em atendimento | CT-133 |
| em atendimento | nova providência | em atendimento | CT-134 |
| aberta ou em atendimento | voltar para aberta | recusado, sem mudança | CT-135 |
| aberta ou em atendimento | encerrar sem observação | recusado, sem mudança | CT-136 |
| aberta ou em atendimento | encerrar com observação | encerrada | CT-137 |
| encerrada | qualquer providência | recusado, sem mudança | CT-138 |

#### Valores limite

Quadro: Valores limite testados

| Fronteira | Valores testados | Caso |
|---|---|---|
| Duração mínima da regra | −1, 0 | CT-069 |
| Duração mínima de 10 min | t0 + 5 min, t0 + 10 min (e t0 + 9 min 59 s, manual) | CT-070 |
| Operador `>` e `>=` em 3,5 | 3,49, 3,5, 3,51 | CT-071 |
| Cota do rio, 3,5 m | 3,5, 3,51 | CT-107 (estendido) |
| Faixas do IQAr do PM2.5 | 15/16, 50/51, 75/76, 125/126, 300/500; 15,4, 15,5, 16,5 | CT-113 (estendido) |
| Mínimo da busca | 2 caracteres, 2 com espaços, 3 | CT-117 (estendido) |

#### Partições de equivalência

Quadro: Partições de equivalência

| Partição | Classes | Casos |
|---|---|---|
| Situação do dispositivo | operando, sem comunicação, manutenção, inativo | CT-078, CT-079, CT-080, CT-081 |
| Perfil de acesso | consulta, operador, gestor, administrador | CT-122, CT-123, CT-124, CT-125 (estendido) |
| Órgão da ocorrência para quem atualiza | mesmo órgão, outro órgão, sem órgão, administrador | CT-120 (estendido) |

## 3 LOG DE EXECUÇÃO

### Onde ficam as evidências

Seção 3 da documentação de teste. Versão sob teste na rodada 1: tag `v1.0-sprint-6` (commit
`01ecf29`); na rodada 2, de 12/11/2026, tag `v1.0.2-sprint-6` (commit `0a38751`), com as correções
dos INC-001 a INC-004 (seção "Rodada 2", abaixo); na rodada 3, de 15 a 17/11/2026, tag
`v1.0.3-sprint-6` (commit `31aad37`), a versão final (seção "Rodada 3", abaixo). Rodada 1 num
clone da tag numa pasta separada do repositório de trabalho, sem nenhum arquivo alterado além do
`.env` criado a partir do `.env.example`. As evidências ficam em `evidencias/`,
uma pasta por rodada (`AAAA-MM-DD-rodada-N/`), com a convenção do README (`evidencias/README.md`)
da pasta. O log completo por caso, com o resultado obtido, a evidência e quem executou cada execução, fica no
arquivo `docs/teste/log-de-execucao.md`; a situação de cada caso em cada rodada, os retestes e os
incidentes estão no quadro de execução da seção 2.

As evidências ficam na pasta `docs/teste/evidencias/` do repositório, e o quadro de execução da seção 2 não repete o caminho de cada uma: a evidência de um caso numa rodada é a captura `CT-NNN.png` (ou `CT-NNN-1.png`, `CT-NNN-2.png`, quando há mais de uma) na pasta da rodada ou do reteste (na rodada 2, direto em `evidencias/`), e a saída de terminal fica na pasta da rodada, em `.txt`. O caminho exato de cada evidência está no log completo. Uma pasta por rodada: `AAAA-MM-DD-rodada-N/`, por exemplo `2026-11-02-rodada-1/`. Dentro dela:

- **Saída da suíte automatizada:** `unidade.txt` e `integracao.txt`, mais `smoke.txt` com o smoke
  test que abre a rodada. Cada arquivo começa com a data, a hora, a versão e o comando usado.
- **Saída do Newman:** `newman.txt`.
- **Captura de tela de caso manual:** uma por caso, nomeada pelo identificador do caso
  (`CT-034.png`). Quando o caso precisa de mais de uma captura, numere na ordem dos passos:
  `CT-049-1.png`, `CT-049-2.png` e assim por diante.

**Rodada 2 (12/11/2026), casos de tela:** por pedido para esta rodada, as capturas ficam direto em
`evidencias/`, com o nome do caso (`CT-034.png`, ou `CT-049-1.png`, `CT-049-2.png` quando há mais
de uma tela), e as saídas de terminal, banco e suíte ficam em `2026-11-12-rodada-2/`.

**Reteste de incidente:** pasta própria, `AAAA-MM-DD-reteste-INC-NNN/`, com a versão corrigida
identificada pelo commit.

### Rodadas e retestes

Quadro: Rodadas de execução, retestes e versão final

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
| Reteste INC-006 | 12/11/2026 21:16 a 21:25 | CT-111 na versão corrigida `95e7189`, banco limpo, e regressão: unidade e integração, banco de teste recriado | 1 caso; 53 + 216 testes | 1; 53 + 216 | 0 | `2026-11-12-reteste-INC-006/` |
| Reteste INC-007 | 13/11/2026 00:50 a 00:58 | CT-018 na versão corrigida `85afa54`, banco limpo, listas por texto pela interface de programação, e regressão | 1 caso; 56 + 217 testes | 1; 56 + 217 | 0 | `2026-11-12-reteste-INC-007/` |
| Reteste INC-009 a INC-012 | 13/11/2026 00:56 a 00:59 | Os quatro achados corrigidos, na `main` com todas as correções (`31aad37`), banco limpo, página recarregada sem cache | 4 achados | 4 | 0 | `2026-11-13-reteste-INC-009-a-012/` |
| Versão final | 13/11/2026 00:59 a 01:03 | Tag `v1.0.3-sprint-6` (`31aad37`): unidade com cobertura, integração com o banco recriado e Newman | 56 + 217 testes; 74 requisições, 133 verificações | 56 + 217; 133 | 0 | `2026-11-13-v1.0.3/` |
| Recaptura v1.0.2 | 13/11/2026 01:59 a 02:01 | CT-095, CT-111, CT-129 e CT-130 na `v1.0.2-sprint-6`, página recarregada sem cache e pacote conferido (`index-C--Xtlx1.js`): telas que dependem do único código de tela que mudou entre a `v1.0` e a `v1.0.2` | 4 casos | mesmo resultado da rodada 2 | 0 | `2026-11-13-recaptura-v1.0.2/` |
| 3 | 15/11/2026 23:41 a 16/11/2026 00:01 | Regressão de tela da seção 1.3: os 26 casos de prioridade alta com parte de tela, repetidos na versão final `v1.0.3-sprint-6` por automação de navegador, clone novo e banco limpo, cada página recarregada sem cache e com o pacote conferido no DOM (`index-DUc74Aew.js`) | 26 casos | 26 | 0 | `2026-11-15-rodada-3/` |
| 3 | 17/11/2026 21:09 | CT-004, caso só manual de prioridade alta sem tela: inspeção do repositório pelo terminal no clone da `v1.0.3-sprint-6` (`31aad37`) | 1 caso | 1 | 0 | `2026-11-15-rodada-3/CT-004.txt` |

Cobertura da suíte de unidade na rodada 1: 98,3% das instruções, 81,44% dos desvios, 95,91% das
funções e 98,79% das linhas.

Na rodada 1, todos os comandos do Compose usaram `-p teste-sprint-6`. O nome do projeto é fixo (`scoc`) no
`docker-compose.yml`, e sem essa opção o clone dividiria o banco com a cópia de desenvolvimento da
mesma máquina (INC-001).

Dados que a rodada 1 deixou no ambiente da versão sob teste e que aparecem nos casos de tela: as
leituras e as ocorrências 2026-11-0001 e 2026-11-0002, do smoke; e, da coleção do Postman, o
dispositivo `PM-MVZXSVM8`, a regra "Validação no Postman PM-MVZXSVM8", o usuário
`postman.<número>@pontagrossa.pr.gov.br`, as ocorrências 2026-11-0003 e 2026-11-0004 e um alerta
reconhecido.

### Rodada 2, casos de tela (12/11/2026)

Execução das verificações de tela que ficaram como "pendente (tela)" na rodada 1: os 57 casos
"automatizado e manual", os 6 só manuais (CT-004, CT-038, CT-039, CT-043, CT-082 e CT-107) e a
parte do painel do CT-005, 64 casos ao todo. A divisão entre os integrantes não se concretizou, e os
casos foram executados por automação de navegador conduzida por um único integrante, Bryan Charles
(seção 5.3 do relatório de conclusão). Por isso, no arquivo do log, a coluna "Quem executou" registra a forma de
execução, e não um nome. CT-004 e CT-126, que não têm tela, foram executados por comandos no
terminal ("automação de terminal").

**Versão e ambiente.** Tag `v1.0.2-sprint-6` (commit `0a38751`), clone novo numa pasta separada
(`~/teste-v102`), banco limpo, projeto do Compose próprio (`COMPOSE_PROJECT_NAME=teste-v102` no
`.env`, com segredos novos gerados por `openssl rand -hex`). Subida às 20:05; casos das 20:09 às
20:46 (BRT). Google Chrome no macOS 15.7 (arm64), Docker 28.1.1, Compose 2.35.1. Viewport de
1440 × 763 px na maior parte dos casos; os primeiros, até o CT-054, numa janela de 1120 × 944 px.

**Evidências.** Uma captura por caso em `evidencias/CT-NNN.png`, ou `CT-NNN-1.png`, `CT-NNN-2.png`
quando o caso tem mais de uma tela, como pedido para esta rodada. As saídas de terminal e banco
ficam em `evidencias/2026-11-12-rodada-2/`. O pacote da tela não foi conferido no DOM nesta rodada;
as capturas do CT-095, CT-111, CT-129 e CT-130, que dependem do código que mudou entre a `v1.0` e a
`v1.0.2`, foram refeitas em 13/11 com o pacote conferido, com o mesmo resultado
(`evidencias/2026-11-13-recaptura-v1.0.2/`; seção 5.3 do relatório).

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

**Teste exploratório.** Além dos casos especificados, as telas foram percorridas sem roteiro durante
a rodada 2. Os seis achados foram abertos em 13/11/2026 como INC-009 a INC-014, com o campo Caso
preenchido como "achado em teste exploratório, fora dos casos especificados" (seção 4).

### Rodada 3, regressão na versão final (15 a 17/11/2026)

Regressão prevista na seção 1.3 do plano: "no fim da execução, os casos manuais de prioridade alta
são repetidos na versão final". A `v1.0.3-sprint-6` mudou código de tela (ordenação por texto,
eixo dos gráficos, texto de unidade no singular, alinhamento das tabelas e largura do seletor de
perfil), e a rodada 2 tinha sido feita na `v1.0.2-sprint-6`. Foram repetidos os 27 casos de
prioridade alta com execução manual: os 26 que têm parte de tela (os "automatizado e manual" de
prioridade alta, o CT-039 e a parte do painel do CT-005) e o CT-004, só manual, que é inspeção do
repositório pelo terminal, sem tela, executado à parte em 17/11 no mesmo clone. Os de tela foram
executados pela mesma automação de navegador da rodada 2, e o CT-004 por comandos no terminal, os
dois conduzidos por Bryan Charles; por isso, no arquivo do log, a coluna "Quem executou" registra a forma de execução. O resultado de cada caso está na coluna Rodada 3 do quadro de execução da seção 2.

**Versão e ambiente.** Tag `v1.0.3-sprint-6` (commit `31aad37`), clone novo numa pasta separada
(`~/regressao-v103`), banco limpo, projeto do Compose próprio (`COMPOSE_PROJECT_NAME=regressao-v103`
no `.env`, com segredos novos gerados por `openssl rand -hex`). Subida das 23:14:59 às 23:40:18 de
15/11, com a construção das imagens; casos das 23:41 de 15/11 às 00:01 de 16/11 (BRT). Google
Chrome no macOS 15.7.4, Docker 28.1.1, Compose 2.35.1, viewport de 1440 × 763 px. Durante o CT-049
a janela mudou de tamanho sozinha (845 × 821) e foi devolvida a 1440 × 900 antes da captura seguinte.

**Pacote da tela conferido.** Cada página foi recarregada sem cache (Cmd+Shift+R) ao ser aberta, e
o `src` do script foi lido no DOM antes da captura: `index-DUc74Aew.js`, o pacote servido pela
`v1.0.3` (`ambiente.txt`). O desvio do cache da seção 5.3 não se repetiu.

**Evidências.** Todas na pasta própria da rodada, `evidencias/2026-11-15-rodada-3/`: capturas
`CT-NNN.png` ou `CT-NNN-1.png`, `CT-NNN-2.png`, saídas de terminal e consultas de leitura no banco
(`.txt`).

**Preparação de dados, registrada como pré-condição.** Tudo pela tela ou pelo MQTT, sem comando
manual no banco; as consultas ao banco foram só de leitura:

- Regra "Nível de atenção (teste)", ≥ 2 m, 0 min, atenção: cadastrada pela tela no CT-020 e usada
  no CT-034, CT-039, CT-044 e CT-048.
- Dispositivo SN-901, cadastrado pela tela no CT-013.
- Ocorrências 2026-11-0001 (Ronda, Defesa Civil), 0002 (Uvaranas, Mobilidade) e 0003 (zona rural,
  sem órgão), registradas pela tela no CT-056 e no CT-059; 0004 (Neves, Infraestrutura), registrada
  em outra aba no CT-039 e usada no CT-086 e no CT-087.
- Leituras do SN-027 publicadas pelo MQTT: 2,4 m (CT-039), 1,5 m (CT-048) e 2,6 m (CT-044).
- Alertas graves abertos pelo próprio simulador: "Chuva forte acumulada" (EA-02, 23:42), "Risco de
  enchente" (SN-014, 23:43) e "Nível do arroio acima da cota" (SN-014, 23:53), usados no CT-049, no
  CT-051 a CT-054.
- Usuários "Operador Defesa Civil (teste)", "Consulta Mobilidade (teste)" e "Gestor Meio Ambiente
  (teste)", cadastrados pela tela no CT-118 e usados no CT-119 e no CT-120. As senhas provisórias
  passaram da aba do administrador para a aba de teste pelo armazenamento local do navegador, sem
  sair da máquina, e foram apagadas no fim.

Resultado: os 27 casos passaram, e nenhum incidente novo foi aberto. As correções da `v1.0.3`
apareceram nas telas percorridas: "Câmera" antes de "Controlador de iluminação" na lista de tipos e
órgãos e usuários em ordem alfabética (INC-007), eixo do gráfico de ocorrências com 0, 2 e 4 nas
posições certas (INC-006), "1 ponto" no singular (INC-011), "Últimas / 3 h" no cabeçalho (INC-012),
nomes alinhados à esquerda nas tabelas de regras e usuários (INC-009) e "Administrador" inteiro no
seletor de perfil (INC-010). Continuam como registrados os abertos INC-005 (data em mês/dia no
Chrome em inglês, visto no CT-013) e INC-013 (mensagem de validação que fica na tela, visto no CT-013).

### Registro do CT-005, ensaio seguindo só o README

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

Quadro: Ensaio do CT-005, passo a passo do README

| Passo do README | Comando que o README mandou executar | O que aconteceu | Informação que faltou no README |
|---|---|---|---|
| Como executar, 1 | `git clone https://github.com/Sivwen0741/projeto-smart-city.git` e `cd projeto-smart-city` | Pela pré-condição do caso, o clone foi da tag: `git clone --branch v1.0-sprint-6`, numa pasta separada. Clone sem alteração, no commit `01ecf29`. | Nenhuma para quem executa a `main`. |
| Como executar, 2 | `cp .env.example .env`; trocar a senha do banco, o `JWT_SEGREDO` e a senha do administrador; `openssl rand -hex 32` para gerar os valores | Os três valores foram gerados com o `openssl`. O `.env` é ignorado pelo git, e nenhum arquivo versionado mudou. | Nenhuma. |
| Como executar, 3 | `docker compose up --build`, ou `docker compose up --build -d` | O README avisa que o nome do projeto é fixo (`scoc`) e que qualquer cópia na mesma máquina usa o mesmo banco. Para senha que não bate, a única saída que ele dá é `docker compose down -v`, que apagaria o banco da cópia de desenvolvimento. Para não tocar nesse banco, os comandos rodaram com `-p teste-sprint-6`, opção que o README não traz. Subida em 1 min 16 s (21:10:23 a 21:11:39). `db`, `mosquitto` e `api` ficaram saudáveis; `simulador` e `web` ficaram em execução, porque não têm verificação de saúde no Compose. Todas as linhas de log que o README cita apareceram: 13 migrações, território com 5 distritos e 16 bairros, administrador criado, 14 dispositivos, 7 regras, ingestão assinando o tópico e simulador com 11 dispositivos a cada 30 s. | Como subir uma segunda cópia isolada na mesma máquina, com outro nome de projeto (INC-001). |
| Como executar, 4 | Abrir `http://localhost:8080` e entrar com o `ADMIN_EMAIL` e a `ADMIN_SENHA` do `.env` | A interface web respondeu 200, com o título "Centro Integrado de Operações Urbanas". Health em `/api/health` respondeu 200 com PostGIS 3.4.3, e o Swagger em `/api/docs` respondeu 200. A tela de login e o painel não foram vistos no navegador. A interface de programação listou os 14 dispositivos de exemplo. | Nenhuma. |
| Usar a interface de programação, 1 | `curl -X POST http://localhost:3000/api/auth/login ...` com o administrador do `.env` | Devolveu o token, com validade de 8 h, e o usuário com perfil administrador. | Nenhuma. |

Encontrado na leitura, fora do caminho de execução: a seção "Situação" do README ainda diz que a
Sprint 4 é a primeira sprint de implementação e manda ao replanejamento da Sprint 4 para os itens
em andamento (INC-002).

Resultado: o ambiente subiu e o login do administrador funcionou seguindo o README. Isso dependeu
de uma informação que o README não dá, a opção `-p`, necessária só porque a máquina já tinha outra
cópia do projeto. Do painel, foi conferido que a interface web respondeu e que a interface de
programação listou os 14 dispositivos de exemplo. A conferência do painel aberto na tela, com os
dispositivos de exemplo no mapa, foi feita na rodada 2 (CT-005 no quadro de execução da seção 2).

## 4 RELATÓRIOS DE INCIDENTE

Seção 4 da documentação de teste. Versão sob teste: tag `v1.0-sprint-6` (commit `01ecf29`) na
rodada 1 e tag `v1.0.2-sprint-6` (commit `0a38751`) na rodada 2, de 12/11/2026. As correções
depois da rodada 2 estão na tag `v1.0.3-sprint-6` (commit `31aad37`).
Severidade conforme o plano. Alta: impede uma função do núcleo, expõe dado ou quebra o controle
de acesso. Média: a função falha, mas há contorno, ou falha um item do escopo estendido. Baixa:
texto, aparência ou incômodo sem efeito no resultado.

### Resumo dos incidentes

Quadro: Resumo dos incidentes

| ID | Resumo | Caso | Severidade | Prioridade | Status |
|---|---|---|---|---|---|
| INC-001 | O README não informa como subir uma segunda cópia isolada na mesma máquina, e a saída que ele dá (`docker compose down -v`) apaga o banco da outra cópia | CT-005 | baixa | média | fechado |
| INC-002 | A seção "Situação" do README está desatualizada: diz que a Sprint 4 é a sprint em andamento | CT-005 | baixa | baixa | fechado |
| INC-003 | O teste US02-3 conta todos os dispositivos sem comunicação do banco, e não só os que ele cria, o que o torna não determinístico mesmo com o banco recriado | CT-042 | baixa | alta | fechado |
| INC-004 | Gráfico histórico fora de escala: rótulos dos eixos com cerca de 40 px e gráfico com mais de 1200 px de altura; não cabe sem rolagem na resolução de teste | CT-129 | baixa | média | fechado |
| INC-005 | Campo "Instalado em" do formulário de dispositivo mostra a data em formato americano (03/14/2024) | CT-013 | baixa | baixa | aberto |
| INC-006 | O eixo vertical do gráfico "Ocorrências abertas hoje" do painel rotula a linha do meio com o valor arredondado: com 3 ocorrências mostra 0, 2, 3; com 1, mostra 0, 1, 1 | CT-111 | baixa | média | fechado |
| INC-007 | A ordenação da lista de dispositivos por Tipo e por Localização põe os nomes acentuados no fim ("Controlador" antes de "Câmera", "Órfãs" depois de "Uvaranas") | CT-018 | média | média | fechado |
| INC-008 | O alerta de poluição por bairro, que não tem dispositivo, não aparece no mapa | CT-127 | — | — | fechado: reclassificado como achado investigado, sem critério que o exija |
| INC-009 | Nas tabelas de regras e de usuários, o nome fica centralizado quando quebra em duas linhas | achado em teste exploratório, fora dos casos especificados | baixa | baixa | fechado |
| INC-010 | No seletor de perfil do formulário de usuário, o texto "Administrador" passa da borda do botão | achado em teste exploratório, fora dos casos especificados | baixa | baixa | fechado |
| INC-011 | Na lista de dispositivos, a última leitura do controlador de iluminação aparece como "1 pontos" | achado em teste exploratório, fora dos casos especificados | baixa | baixa | fechado |
| INC-012 | O cabeçalho "Últimas 3 h" da lista de dispositivos quebra o "h" para a segunda linha | achado em teste exploratório, fora dos casos especificados | baixa | baixa | fechado |
| INC-013 | No formulário de dispositivo, as mensagens de validação continuam na tela depois de o campo ser corrigido, até o próximo envio | achado em teste exploratório, fora dos casos especificados | baixa | baixa | aberto |
| INC-014 | "Detalhes" de um alerta aberto abre o mesmo painel de "Reconhecer" | achado em teste exploratório, fora dos casos especificados | baixa | baixa | aberto |

### INC-001 — README sem forma de isolar uma segunda cópia do projeto

Quadro: Relatório do INC-001 — README sem forma de isolar uma segunda cópia do projeto

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

### INC-002 — Seção "Situação" do README desatualizada

Quadro: Relatório do INC-002 — Seção "Situação" do README desatualizada

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
| Reteste | 02/11/2026, 21:30 a 21:34, pelo CT-005, na versão `1a64496`, por Bryan Charles. Clone novo da branch, que já tinha a correção do INC-001. A seção "Situação" não cita mais a Sprint 4 como sprint em andamento, e os oito links dela apontam para arquivos que existem. O ambiente subiu isolado pelo `.env`, e a interface, o health e o login responderam. **Passou.** Na regressão, a unidade deu 53/53. A integração deu 215/216 na 1ª execução, com falha no US02-3, e 216/216 na 2ª, as duas com o banco recriado. A falha não envolve o README, único arquivo alterado, e foi registrada como INC-003. Evidência: `evidencias/2026-11-02-reteste-INC-002/`. |
| Status e responsável | Fechado em 02/11/2026, depois do reteste. Bryan Charles. |

### INC-003 — US02-3 não determinístico na contagem de dispositivos sem comunicação

Quadro: Relatório do INC-003 — US02-3 não determinístico na contagem de dispositivos sem comunicação

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

### INC-004 — Gráfico histórico fora de escala

Quadro: Relatório do INC-004 — Gráfico histórico fora de escala

| Campo | Valor |
|---|---|
| Data e quem registrou | 02/11/2026, Bryan Charles, por inspeção das telas |
| Item testado e versão | US19 (gráfico histórico), `v1.0-sprint-6`, no clone da tag |
| Caso de teste relacionado | CT-129 (a correção também é retestada pelo CT-130) |
| Passos para reproduzir | 1. Abrir `http://localhost:8080` numa janela de 1456 × 817 e entrar com o administrador. 2. Dispositivos › SN-014 › Ver histórico. 3. Período 24 h. |
| O que aconteceu | Os rótulos dos eixos aparecem com cerca de 40 px, e o gráfico passa de 1200 px de altura. Foi preciso rolar duas vezes para ver o eixo do tempo. |
| O que era esperado | O gráfico inteiro, com o eixo do tempo e a legenda dos limites, cabendo sem rolagem na resolução de teste do plano (1440 × 900, seção 1.4). |
| Ambiente | Clone da tag `v1.0-sprint-6` em http://localhost:8080; Google Chrome numa janela de 1456 × 817. |
| Severidade e prioridade | Baixa: não há perda de função. Média: o gráfico não cabe na tela na resolução em que o sistema é testado. |
| Causa | O `GraficoLinha` desenhava num `viewBox` de 400 unidades de largura e ocupava 100% da largura do contêiner, com altura automática. O SVG inteiro, fonte e altura juntas, escalava na proporção da largura da área do gráfico dividida por 400. Na tela de histórico, que é larga, a fonte de legenda de 11 px chegava perto dos 40 px observados, e a altura crescia na mesma proporção. |
| Correção | Commit `a73fdd9` (branch `sprint-6-inc-004`, PR #30, mesclado na `main` em `686ed19`). O `GraficoLinha` aceita a largura em pixels, e o `viewBox` acompanha o contêiner (escala 1). A tela de histórico mede a área do gráfico com `ResizeObserver` e desenha com 320 px de altura. Painel e Rios mantêm o comportamento anterior. Teste automatizado: não se aplica, porque a interface web não tem executor de teste (DT05). |
| Reteste | 02/11/2026, 21:52 a 21:58, na versão `a73fdd9`, por Bryan Charles, numa instância separada da versão corrigida, com o Chrome em 1440 × 900. CT-129 (SN-014, 24 h): gráfico com 320 px de altura, eixos em 11 px, e a seção com o eixo do tempo e a legenda termina a 634 px do topo, sem rolagem. CT-130 (PM2.5 da EA-03): linha tracejada de 55 µg/m³ com o rótulo e a legenda, sem rolagem. Regressão: unidade 53/53, integração 216/216. **Passou.** Evidência: `evidencias/2026-11-02-reteste-INC-004/` (`CT-129.png`, `CT-130.png`, `reteste.txt`). |
| Status e responsável | Fechado em 02/11/2026, depois do reteste. Bryan Charles. |

### INC-005 — Data de instalação em formato americano

Quadro: Relatório do INC-005 — Data de instalação em formato americano

| Campo | Valor |
|---|---|
| Data e quem registrou | 02/11/2026, Bryan Charles, por inspeção das telas |
| Item testado e versão | US22 (cadastro de dispositivo), `v1.0-sprint-6`, no clone da tag |
| Caso de teste relacionado | CT-013 |
| Passos para reproduzir | 1. Abrir `http://localhost:8080` num Chrome com o idioma em inglês e entrar com o administrador. 2. Dispositivos › abrir um dispositivo com data de instalação, ou Cadastrar dispositivo. 3. Ver o campo "Instalado em". |
| O que aconteceu | O campo mostra 03/14/2024, no formato mês/dia/ano. É um `input type="date"` nativo, e o navegador da máquina está em inglês. |
| O que era esperado | Data em dd/mm/aaaa, como no resto do sistema, inclusive no cabeçalho e nas colunas das listas. |
| Ambiente | Clone da tag `v1.0-sprint-6` em http://localhost:8080; Google Chrome com o idioma em inglês. |
| Severidade e prioridade | Baixa. Baixa. |
| Investigação | O documento já declara `lang="pt-BR"` (`web/index.html`) desde a primeira versão, e o campo continua em mês/dia/ano. O Chrome formata o `input type="date"` pelo idioma da interface do navegador, não pelo `lang` da página. A única correção na aplicação é trocar o campo nativo por um componente próprio de data. |
| Decisão | Não corrigir nesta entrega (decisão de 02/11/2026). A duas semanas da entrega, trocar um componente de formulário traz risco maior que o defeito. O incidente fica aberto e entra nos riscos residuais (seção 5.4 do relatório de conclusão). |
| Status e responsável | Aberto. Bryan Charles. |

### INC-006 — Rótulo arredondado no eixo do gráfico de ocorrências do painel

Quadro: Relatório do INC-006 — Rótulo arredondado no eixo do gráfico de ocorrências do painel

| Campo | Valor |
|---|---|
| Data e quem registrou | 12/11/2026, Bryan Charles, na rodada 2 (automação de navegador) |
| Item testado e versão | US12 (painel, gráfico "Ocorrências abertas hoje"), `v1.0.2-sprint-6` |
| Caso de teste relacionado | CT-111 |
| Passos para reproduzir | 1. Banco limpo. 2. Registrar uma ocorrência e abrir o painel: o eixo vertical mostra 0, 1, 1. 3. Registrar mais duas: o eixo mostra 0, 2, 3. |
| O que aconteceu | O gráfico desenha três linhas de grade: o mínimo, o meio e o máximo. A do meio fica em (mínimo + máximo) / 2, e o rótulo é formatado com zero casas decimais. Com máximo 1, a linha de 0,5 aparece como "1", repetindo o rótulo do topo. Com máximo 3, a linha de 1,5 aparece como "2". Com 5 ocorrências, 2,5 aparece como "3". A linha da série está certa, mas quem lê pelo eixo encontra um valor que a linha do meio não tem. Origem: `web/src/componentes/GraficoLinha.tsx:70`. |
| O que era esperado | Rótulos que correspondam à posição das linhas de grade: marcas inteiras para contagem (0, 1, 2, 3) ou rótulo com a casa decimal. |
| Ambiente | Clone da tag `v1.0.2-sprint-6`, projeto `teste-v102`, Chrome no macOS. |
| Severidade e prioridade | Baixa: a série e os totais estão corretos, e o defeito está no rótulo do eixo. Média: o gráfico fica na tela inicial e o mesmo componente desenha os gráficos de rios e do histórico. |
| Evidência | `evidencias/CT-111-1.png`, `CT-111-2.png`, `CT-111-3.png` |
| Correção | Commit `95e7189` (branch `sprint-6-inc-006`, mesclada na `main` em `9d5d478`). As marcas da grade passam a ficar no valor arredondado que o rótulo mostra, e marcas repetidas são removidas. A correção vale para os três gráficos que usam o componente: ocorrências do painel, rios e histórico. |
| Reteste | 12/11/2026, 21:16 a 21:25, pelo CT-111, na versão `95e7189`, num clone com banco limpo. Com 1 ocorrência, o eixo mostra 0 e 1; com 3, mostra 0, 2 e 3, e cada rótulo está na posição do próprio valor. Os gráficos de rios e do histórico foram conferidos de novo em 13/11 na `main` com todas as correções. Regressão: unidade 53/53 e integração 216/216 com o banco recriado. **Passou.** Evidência: `evidencias/2026-11-12-reteste-INC-006/`. |
| Status e responsável | Fechado em 12/11/2026, depois do reteste. Bryan Charles. |

### INC-007 — Ordenação alfabética da lista de dispositivos ignora os acentos

Quadro: Relatório do INC-007 — Ordenação alfabética da lista de dispositivos ignora os acentos

| Campo | Valor |
|---|---|
| Data e quem registrou | 12/11/2026, Bryan Charles, na rodada 2 (automação de navegador) |
| Item testado e versão | US22 (lista de dispositivos), `v1.0.2-sprint-6` |
| Caso de teste relacionado | CT-018 |
| Passos para reproduzir | 1. Dispositivos. 2. Clicar no cabeçalho Tipo: a ordem crescente começa por "Controlador de iluminação" e só depois "Câmera". 3. Clicar em Localização: "Órfãs" fica depois de "Uvaranas". |
| O que aconteceu | A ordenação é feita pelo banco (`ORDER BY` em `api/src/dispositivos/dispositivos.service.ts`). O banco da imagem `postgis/postgis:16-3.4-alpine` usa a collation `en_US.utf8`, mas a biblioteca C da Alpine (musl) não implementa essa collation e compara byte a byte, então letras acentuadas vão para depois do "z". O mesmo efeito aparece na lista de tipos do formulário de dispositivo, também ordenada pelo banco. |
| O que era esperado | Ordem alfabética do português: "Câmera" antes de "Controlador"; "Órfãs" entre "Olarias" e "Ronda". |
| Ambiente | Clone da tag `v1.0.2-sprint-6`, projeto `teste-v102`; banco `en_US.utf8` (consultado em `pg_database`). |
| Severidade e prioridade | Média: a ordenação, uma função do critério US22, dá resultado errado para nomes acentuados; há contorno (ler a lista inteira). Média. |
| Evidência | `evidencias/CT-018-1.png`, `CT-018-2.png`; ordens lidas na tela registradas no log (CT-018) |
| Correção | Commit `85afa54` (branch `sprint-6-inc-007`, mesclada na `main` em `23aa0c5`). As ordenações por texto deixam de depender da collation do banco e passam a usar `localeCompare` em pt-BR (`api/src/ordem-texto.ts`): dispositivos por tipo e por localização, tipos de dispositivo, usuários, regras, órgãos, dispositivos sem comunicação por tipo e bairros do gráfico do painel. A conferência das listas pedida no reteste mostrou que alertas e ocorrências não ordenam por texto (gravidade, situação e data). Testes novos: três na suíte de unidade e "US22-6 tipo e localização seguem a ordem alfabética do português" na integração. |
| Reteste | 13/11/2026, 00:50 a 00:58, pelo CT-018, na versão `85afa54`, num clone com banco limpo. Tipo crescente: "Câmera, Câmera, Controlador de iluminação, …"; Localização crescente: "… Olarias, Olarias, Órfãs, Ronda, Uvaranas"; decrescente, o inverso. Tipos, órgãos, regras e usuários conferidos pela interface de programação. Regressão: unidade 56/56 e integração 217/217 com o banco recriado. **Passou.** Evidência: `evidencias/2026-11-12-reteste-INC-007/`. |
| Status e responsável | Fechado em 13/11/2026, depois do reteste. Bryan Charles. |

### INC-008 — Alerta de poluição por bairro não aparece no mapa (reclassificado)

Quadro: Relatório do INC-008 — Alerta de poluição por bairro não aparece no mapa (reclassificado)

| Campo | Valor |
|---|---|
| Data e quem registrou | 12/11/2026, Bryan Charles, na rodada 2 (automação de navegador) |
| Item testado e versão | US18 (alerta de poluição por bairro), `v1.0.2-sprint-6` |
| Caso de teste relacionado | CT-127 |
| Passos para reproduzir | 1. Preparar o alerta como no README das evidências: regra "Material particulado elevado" com limite 5 e reinício da interface de programação. 2. Conferir em Alertas: 16 alertas "Material particulado elevado" com "Open-Meteo" no lugar do dispositivo. 3. Abrir o Mapa ou o painel. |
| O que aconteceu | O mapa não mostra nenhum dos 16 alertas: a legenda fica em "Atenção · 0" e não há marca nos bairros. O componente do mapa (`web/src/componentes/MapaCidade.tsx`) só desenha dispositivos, coloridos pelo alerta ativo, e ocorrências. Um alerta sem dispositivo não tem o que pintar. A interface de programação devolve a latitude e a longitude do alerta (critério US18-2, verificado só pela API na Sprint 6). Na lista e no painel do alerta, a fonte, o bairro e a ausência de dispositivo aparecem corretamente. |
| O que era esperado | A ficha do CT-127 pede o alerta "no mapa, dentro do bairro". |
| Ambiente | Clone da tag `v1.0.2-sprint-6`, projeto `teste-v102`, Chrome no macOS; pré-condição alterada e desfeita (limite 5 às 20:41, de volta a 55 às 20:44). |
| Severidade e prioridade | Registrada como média na abertura. Retirada na reclassificação. |
| Evidência | `evidencias/CT-127-1.png` a `CT-127-4.png`; `evidencias/2026-11-12-rodada-2/CT-127-CT-128-preparacao.txt` |
| Investigação | Nenhum critério de aceite exige o alerta de bairro no mapa. Os critérios da US18 (`docs/sprint-6-criterios.md`) pedem que as regras valham para as leituras do Open-Meteo, que o alerta indique o bairro e a fonte do dado e que o Meio Ambiente seja sugerido. Os da US01 pedem no mapa os dispositivos, com a cor do alerta ativo, e as ocorrências abertas. A camada de qualidade do ar no mapa é a US17-2, fora do escopo e no backlog da Sprint 7. A decisão `2026-10-27-poluicao-por-bairro.md` diz que o alerta guarda o ponto interno do bairro como posição, mas não o põe na tela. A expectativa "no mapa, dentro do bairro" foi escrita na ficha do CT-127 sem critério de origem. |
| Reclassificação | Não é defeito: é comportamento não especificado. Fica registrado como achado investigado (seção "Achados investigados", abaixo) e como item de backlog: mostrar no mapa o alerta de bairro, junto com a camada de qualidade do ar da US17. A ficha do CT-127 ganhou uma observação, e o caso foi reavaliado no log. |
| Status e responsável | Fechado em 13/11/2026, reclassificado como achado investigado. Bryan Charles. |

### INC-009 a INC-014 — Achados em teste exploratório

Durante a rodada 2, além dos casos especificados, as telas foram percorridas sem roteiro. Esse teste
exploratório gerou seis achados, que estavam no log como observações e foram abertos como incidentes
em 13/11/2026, por Bryan Charles, na versão `v1.0.2-sprint-6`. Severidade conforme o efeito: os seis
são de aparência, texto ou incômodo, sem efeito no resultado. Os que eram texto ou uma linha de
estilo foram corrigidos (INC-009 a INC-012). Os dois que pedem mudar comportamento de tela ficam
abertos (INC-013 e INC-014).

Quadro: Relatórios dos INC-009 a INC-014, achados em teste exploratório

| Campo | INC-009 | INC-010 | INC-011 | INC-012 | INC-013 | INC-014 |
|---|---|---|---|---|---|---|
| Item testado | US23 e US21 (tabelas de regras e de usuários) | US21 (formulário de usuário) | US22 (lista de dispositivos) | US19 (lista de dispositivos) | US22 (formulário de dispositivo) | US04 e US02 (lista de alertas) |
| Caso de teste relacionado | achado em teste exploratório, fora dos casos especificados | idem | idem | idem | idem | idem |
| Passos para reproduzir | Abrir Regras ou Usuários e abrir o painel lateral, com um nome que quebre em duas linhas | Usuários › abrir um usuário › ver o seletor Perfil | Dispositivos › IL-118 com 1 ponto apagado | Dispositivos › cabeçalho da coluna das últimas 3 h | Cadastrar dispositivo › enviar vazio › preencher código e tipo | Alertas › "Detalhes" num alerta aberto |
| O que aconteceu | O nome é um botão, e o botão centraliza o texto quando quebra | Colunas de largura igual (`minmax(0, 1fr)`), menores que a palavra "Administrador" | "1 pontos" | "Últimas 3" na primeira linha e "h" na segunda | "Escolha o tipo do dispositivo." e "Informe o código identificador." continuam visíveis até o próximo envio | Abre o painel de reconhecimento, o mesmo do botão "Reconhecer" |
| O que era esperado | Nome alinhado à esquerda, como as outras colunas | O texto inteiro dentro do botão | "1 ponto" | "Últimas" e "3 h" | A mensagem some quando o campo é corrigido | Um painel de consulta, separado da ação de reconhecer |
| Severidade e prioridade | Baixa. Baixa. | Baixa. Baixa. | Baixa. Baixa. | Baixa. Baixa. | Baixa. Baixa. | Baixa. Baixa. |
| Correção | `cd11a3d` (`sprint-6-inc-009`): `text-align: left` no botão do nome | `6c9243a` (`sprint-6-inc-010`): colunas `minmax(min-content, 1fr)` | `9a844d9` (`sprint-6-inc-011`): unidade no singular quando o valor é 1 ("ponto", "vaga") | `55668ca` (`sprint-6-inc-012`): espaço sem quebra entre "3" e "h" | Não corrigido: muda a validação do formulário | Não corrigido: pede um painel de consulta novo |
| Reteste | 13/11/2026, na `main` com as correções (`31aad37`): o nome longo quebra alinhado à esquerda. **Passou.** | Idem: as quatro opções cabem (75, 75, 75 e 90 px). **Passou.** | Idem: "1 ponto". **Passou.** | Idem: "Últimas" / "3 h". **Passou.** | — | — |
| Status | Fechado | Fechado | Fechado | Fechado | Aberto | Aberto |

Evidência dos retestes: `evidencias/2026-11-13-reteste-INC-009-a-012/`. A regressão das quatro
correções é a da tag `v1.0.3-sprint-6`: unidade 56/56, integração 217/217 com o banco recriado e
Newman 133/133 (`evidencias/2026-11-13-v1.0.3/`).

### Achados investigados, sem incidente

Situações que pareciam defeito e, investigadas, não eram, por não haver requisito que as exigisse.

Quadro: Achados investigados, sem incidente

| Achado | Data | O que foi visto | Investigação | Destino |
|---|---|---|---|---|
| "137 dispositivos em campo" na tela de login | 02/11/2026 | A tela de login mostra "137 dispositivos em campo", e o sistema tem 14 dispositivos. | O número é texto fixo do protótipo `01-login.svg`. A tela de login é pública, e as rotas públicas não podem ler o banco (decisão das rotas públicas). | Mantido como no protótipo; não aberto como incidente. |
| Alerta de poluição por bairro fora do mapa (era o INC-008) | 12/11/2026 | O alerta de bairro, sem dispositivo, não aparece no mapa. | Nenhum critério da US18 ou da US01 pede isso; a camada de qualidade do ar no mapa é a US17-2, fora do escopo. Ver a ficha do INC-008. | Fechado como achado; item de backlog para a Sprint 7, junto com a US17. |

## 5 RELATÓRIO DE CONCLUSÃO

**Resumo.** A versão `v1.0.3-sprint-6` está pronta para a entrega, com ressalvas. Os 139 casos
planejados foram executados. Na primeira execução, 136 passaram. Ao final, os 139 estão aprovados:
dois passaram no reteste depois da correção, e um passou na reavaliação, depois que a exigência que
o fez falhar se mostrou sem critério de origem. Nenhum incidente de severidade alta foi registrado, e
três de severidade baixa continuam abertos. A verificação de tela foi feita por um único integrante,
por automação de navegador, sem a independência que o plano previa.

### 5.1 Métricas

Quadro: Métricas

| Métrica | Valor |
|---|---|
| Casos executados / planejados | 139 / 139 (100%). Rodada 1 (02/11, `v1.0-sprint-6`): os 75 casos só automatizados, a parte automatizada dos 57 casos "automatizado e manual" e o ensaio do CT-005. Rodada 2 (12/11, `v1.0.2-sprint-6`): a parte de tela dos 57, os 6 só manuais e a parte do painel do CT-005. Retestes em 02, 12 e 13/11 nas versões corrigidas. Rodada 3 (15 a 17/11, `v1.0.3-sprint-6`): regressão dos 27 casos de prioridade alta com execução manual, os 26 com parte de tela e o CT-004, todos aprovados, sem incidente novo. |
| Taxa de aprovação ao final | Primeira execução: 136 de 139 (97,8%). Após correção e reteste: 139 de 139 (100%). Falharam na primeira execução CT-018, CT-111 e CT-127, todos de prioridade média: CT-018 e CT-111 passaram no reteste depois das correções dos INC-007 e INC-006; CT-127 passou na reavaliação, porque a parte que falhou não tinha critério de origem (INC-008, reclassificado). Prioridade alta: 78 de 78 (100%), todos na primeira execução. |
| Incidentes registrados | 14. Um deles, o INC-008, foi reclassificado como achado investigado, porque nenhum critério o exige. Dos 13 defeitos: alta 0, média 1 (INC-007), baixa 12 (INC-001 a INC-006 e INC-009 a INC-014). Sete vieram dos casos especificados (INC-001 a INC-007) e seis do teste exploratório (INC-009 a INC-014). |
| Incidentes abertos | 3, todos de severidade baixa: INC-005 (data em mês/dia num navegador em inglês), INC-013 (mensagem de validação que fica na tela) e INC-014 ("Detalhes" de alerta aberto abre o painel de reconhecimento). Os outros dez foram fechados depois do reteste. |
| Testes automatizados | Na versão final, `v1.0.3-sprint-6` (13/11): unidade 56 de 56, com cobertura de 98,33% das instruções, 82,17% dos desvios, 96% das funções e 98,82% das linhas; integração e sistema 217 de 217, com o banco de teste recriado; coleção do Postman pelo Newman com 74 requisições e 133 de 133 verificações. Os quatro testes a mais (três de unidade e um de integração) vieram com a correção do INC-007. Na `v1.0.2-sprint-6` (12/11), a integração deu 216/216 em cinco execuções seguidas, cada uma com o banco recriado, e o Newman deu 133/133. |
| Histórias cobertas por pelo menos um caso | 21 de 21 itens do escopo: 11 do núcleo (TT01, US20, US22, US23, TT02, US01, US02, US03, US28, US04, US05) e 10 do estendido (TT02-9, US06, US07, US09, US10, US12, US26, US21, US18, US19). Os elementos de tela de US08, US16 e US25, do backlog, têm o CT-082. |

### 5.2 Avaliação dos critérios de conclusão

Quadro: Avaliação dos critérios de conclusão

| Critério (do plano) | Situação |
|---|---|
| 1. Todos os casos de prioridade alta aprovados | Atendido. Os 78 casos de prioridade alta passaram, todos na primeira execução. |
| 2. Nenhum incidente de severidade alta em aberto | Atendido. Nenhum incidente de severidade alta foi registrado. Os três abertos são de severidade baixa. |
| 3. Suíte automatizada verde num banco de teste recriado, na versão final | Atendido. Na `v1.0.3-sprint-6`, a unidade deu 56/56, a integração e sistema 217/217 com o banco recriado e a coleção do Postman 133 de 133 verificações. |
| 4. Cada história do núcleo coberta por ao menos um caso executado | Atendido. As 11 histórias e tarefas do núcleo têm casos executados e aprovados. |

### 5.3 Desvios do plano

- **Vocabulário da situação do caso estendido durante a execução (02/11/2026).** O plano previa
  três valores para a situação de um caso no log: passou, falhou e bloqueado. Na rodada 1, 57
  casos "automatizado e manual" tiveram a parte automatizada aprovada, mas a verificação de tela,
  que é manual, ainda não tinha sido executada. Nenhum dos três valores descrevia essa situação:
  "passou" afirmaria uma verificação que não ocorreu, e "bloqueado" indicaria um impedimento que
  não existia. O vocabulário da seção "Formato dos registros da execução" do plano foi completado
  com "pendente (tela)": a parte automatizada passou, e a verificação de tela ainda não foi
  executada. Um plano que não consegue expressar execução parcial está incompleto, e o certo é
  completá-lo, não forçar o log a registrar um resultado que não ocorreu.
- **Execução dos casos manuais por um único integrante, com automação de navegador (12/11/2026).**
  A divisão dos casos manuais entre os quatro integrantes, planejada em
  `distribuicao-manual.md`, não se concretizou por indisponibilidade da
  equipe no período de execução. Os casos de verificação de tela foram executados por automação de
  navegador conduzida por um único integrante, Bryan Charles. No arquivo do log (`log-de-execucao.md`), a coluna "Quem executou"
  desses casos registra "automação de navegador", não o nome de um integrante. Os dois casos da
  rodada sem tela, CT-004 (inspeção do repositório) e a coleta real do CT-126, foram executados pela
  mesma automação, com comandos no terminal, e aparecem como "automação de terminal". O plano de
  divisão fica como estava, porque foi o planejamento real; o desvio está aqui.
- **Verificação de tela na versão com as correções, e não na versão do corte (12/11/2026).** O
  plano manda executar os casos na `v1.0-sprint-6`. As verificações de tela ficaram para a rodada 2,
  feita na `v1.0.2-sprint-6`, que reúne as correções dos INC-001 a INC-004. Entre as duas tags
  mudaram o README, o nome do projeto no Compose, um teste automatizado e o gráfico histórico. A
  rodada 2 usou um clone novo da tag, com o banco limpo.
- **Dados preparados para os casos de tela.** Alguns casos pedem estado que um banco limpo não tem,
  como histórico de 30 dias, chuva num bairro sem estação e perfis de usuário. Esses dados foram
  criados pela tela, pela interface de programação ou pelo MQTT, nunca por comando no banco, e cada
  preparação está registrada como pré-condição no log da rodada 2.
- **Teste exploratório além dos casos especificados (12/11/2026).** O plano só prevê os 139 casos.
  Na rodada 2, as telas também foram percorridas sem roteiro, e esse teste exploratório gerou seis
  achados, abertos como INC-009 a INC-014, com o campo Caso preenchido como "achado em teste
  exploratório, fora dos casos especificados". Quatro, que eram texto ou uma linha de estilo, foram
  corrigidos; dois ficam abertos.
- **Exigência sem critério de origem numa ficha (13/11/2026).** A ficha do CT-127 pedia o alerta de
  poluição "no mapa, dentro do bairro", o que nenhum critério da US18 ou da US01 exige. O caso falhou
  por isso, e o INC-008 foi aberto. Investigado, o incidente foi reclassificado como achado, a
  exigência saiu da ficha, com uma observação, e o caso foi reavaliado no log.
- **Capturas com o pacote da tela em cache (12 e 13/11/2026).** O Chrome guardava o `index.html` da
  versão anterior e, ao navegar, carregava o pacote JavaScript antigo, mesmo com o servidor já
  servindo a versão nova. Duas rodadas de reteste foram afetadas: a do INC-006, em 12/11, cujas
  capturas dos gráficos de rios e do histórico foram descartadas e refeitas em 13/11; e a dos
  INC-009 a INC-012, em 13/11, cujas primeiras capturas mostravam o código da `v1.0.2` e foram
  descartadas antes de entrar no repositório. Todas as capturas guardadas desses retestes foram
  feitas com a página recarregada sem cache e com o pacote conferido no DOM. A rodada 2 não
  conferiu o pacote no DOM. Entre a `v1.0-sprint-6` e a `v1.0.2-sprint-6`, só o componente de
  gráfico e a tela de histórico mudaram, e as capturas que dependem deles (CT-095, CT-111, CT-129 e
  CT-130) foram refeitas em 13/11 na `v1.0.2`, com o pacote conferido, com o mesmo resultado
  (`evidencias/2026-11-13-recaptura-v1.0.2/`). As capturas originais da rodada 2 desses quatro casos
  continuam no repositório, ao lado da recaptura: `evidencias/CT-095-1.png`, `CT-095-2.png`,
  `CT-111-1.png` a `CT-111-3.png`, `CT-129-1.png` a `CT-129-4.png`, `CT-130-1.png` e `CT-130-2.png`.
  As demais telas da rodada 2 têm o mesmo código nas duas versões.

### 5.4 Riscos residuais

- **INC-005, data de instalação em formato americano (aberto, severidade baixa).** Num navegador
  com a interface em inglês, o campo "Instalado em" do formulário de dispositivo mostra a data em
  mês/dia/ano. O resto do sistema mostra dia/mês. O `lang="pt-BR"` do documento não muda isso no
  Chrome, e a correção exige trocar o campo nativo por um componente próprio. Em 02/11/2026 isso
  foi julgado mais arriscado que o defeito, a duas semanas da entrega. Efeito: quem usa o
  navegador em inglês pode ler ou digitar a data com dia e mês trocados; com o navegador em
  português, o campo já aparece em dia/mês.
- **INC-013, mensagem de validação que fica na tela (aberto, severidade baixa).** No formulário de
  dispositivo, depois de um envio recusado, as mensagens continuam visíveis enquanto o operador
  corrige os campos, até o próximo envio. O cadastro funciona; o operador pode achar que o campo
  corrigido ainda está errado.
- **INC-014, "Detalhes" de alerta aberto abre o painel de reconhecimento (aberto, severidade
  baixa).** Quem só quer consultar o alerta cai no painel que pede a providência. Nada é gravado sem
  confirmar.
- **Alerta de poluição por bairro fora do mapa (achado, sem incidente).** O alerta aparece na lista,
  no painel do alerta, no indicador de qualidade do ar e no quadro do painel, mas não no mapa. Não
  há critério que o exija; fica como item de backlog, junto com a camada de qualidade do ar da US17.
- **Três testes de integração ainda medem contagens do banco inteiro (risco residual, sem
  incidente).** O mecanismo é o do INC-003: o teste lê um total do banco de teste antes e depois de
  agir e compara a diferença, então qualquer registro que outra suíte ou uma rotina crie entre as
  duas leituras entra na conta. O INC-003 corrigiu só o caso dos dispositivos sem comunicação. Os
  três que seguem com a mesma forma são `us02.e2e-spec.ts` › "US02-3 os indicadores contam ativos,
  graves sem reconhecimento, em atendimento, encerrados, tempo até o reconhecimento e 24 h";
  `us12.e2e-spec.ts` › "US12-4 "abertas hoje" acumula as de hoje por hora contra a média das quatro
  semanas anteriores", que depende também de a hora não virar entre as duas leituras; e
  `us05.e2e-spec.ts` › "US05-5 alerta já vinculado ou inexistente não abre outra ocorrência". Em
  12/11/2026, cinco execuções seguidas na `v1.0.2-sprint-6`, com o banco recriado antes de cada uma,
  deram 216/216, e nenhum dos três falhou (`evidencias/2026-11-12-rodada-2/integracao-1.txt` a
  `integracao-5.txt`). O risco é uma falha intermitente sem defeito no sistema, como a do INC-003.
- **DT08 e DT06: verificação sem independência.** O ensaio em máquina limpa (CT-005) e todas as
  verificações de tela foram executados pelo autor do código, por automação. Defeito de entendimento
  do requisito pode passar pelo código, pelo teste e pela verificação ao mesmo tempo, como mostrou a
  exigência sem critério na ficha do CT-127. A lacuna mais sensível continua sendo o README lido por
  quem nunca o viu, que é o avaliador.

### 5.5 Lições aprendidas

**O que funcionou**

- Registramos os débitos em vez de escondê-los. A falta de automação de tela (DT05), a falta de
  revisão cruzada (DT06), as suítes acopladas pela ordem de execução (DT07) e o ensaio sem
  independência (DT08) estão em `docs/decisoes/` e na verificação de cada sprint, com a origem e o
  destino. Quando o INC-003 apareceu, deu para dizer em minutos que não era o DT07, porque o DT07
  estava escrito.
- Cada critério tem um teste com o número no nome. Isso permitiu ligar cada caso de teste a um
  arquivo e a um teste existentes, e o gerador de casos recusa citar um teste que não exista.
- Correções pequenas, cada uma numa branch com o número do incidente, reteste do caso que falhou e
  regressão das suítes, reunidas numa tag. O que entrou depois do corte pode ser rastreado commit a
  commit.
- Recriar o banco de teste antes de cada execução oficial tirou o DT07 do caminho das rodadas.
- Investigar antes de corrigir. O INC-008 seria uma tela nova feita às pressas; a leitura dos
  critérios mostrou que a exigência não existia.

**O que faríamos diferente**

- Dividiríamos o trabalho de teste quando o plano foi aprovado, e não na véspera da execução. A
  divisão dos 64 casos manuais entre quatro pessoas, com ordem e tempo estimado, não se concretizou:
  na hora de executar, só um integrante estava disponível, e a independência que justificava a
  divisão se perdeu.
- Daríamos o CT-005 a outra pessoa enquanto ainda havia tempo. O ensaio em máquina limpa existe para
  pegar o que o autor do README não enxerga; feito pelo autor, perdeu o propósito, e isso virou o
  DT08 em vez de ser resolvido.
- Escreveríamos os testes de integração sobre os próprios dados, e não sobre totais do banco. Os
  testes que comparam contagens do banco inteiro antes e depois são não determinísticos por
  construção; o INC-003 corrigiu um, e três seguem com a mesma forma.
- Não deixaríamos uma ferramenta gravar sobre um documento editado à mão. O gerador dos casos
  sobrescreveu a distribuição manual duas vezes com a versão antiga, e a divisão revisada só não se
  perdeu porque estava no histórico do git. A correção foi separar as saídas: o gerador só escreve a
  distribuição quando pedido.
- Conferiríamos cada resultado esperado das fichas contra o critério de origem antes de executar. A
  exigência do mapa no CT-127 foi escrita por quem escreveu o código e os testes, e ninguém a leu
  contra a US18 até ela falhar.

### 5.6 Recomendação

Liberar a `v1.0.3-sprint-6` para a entrega. Os quatro critérios de conclusão do plano estão
atendidos, os 139 casos estão aprovados e os três incidentes abertos são de severidade baixa, com
efeito descrito na 5.4.

Em seguida:

1. Levar ao backlog da Sprint 7 o INC-013, o INC-014 e o alerta de bairro no mapa, este junto com a
   camada de qualidade do ar da US17. O alerta no mapa e o painel de consulta do INC-014 são telas
   novas e precisam ser desenhados e mostrados antes, pela regra do projeto.
2. Reescrever os três testes de integração que comparam totais do banco, cada um sobre os próprios
   dados, como foi feito no INC-003.
3. Na próxima entrega, executar o CT-005 e uma amostra dos casos de tela por outro integrante, para
   fechar o DT08 e reduzir o risco do DT06.

## 6 TESTES AUTOMATIZADOS

Quadro: Testes automatizados

| Campo | Valor |
|---|---|
| Ferramenta | Jest 30 com ts-jest, Supertest e `@nestjs/testing`; Newman para a coleção do Postman |
| Local no repositório | `api/test/unidade/` (unidade), `api/test/*.e2e-spec.ts` (integração e sistema pela interface de programação), `docs/postman/` (coleção) |
| Como executar | Unidade, com cobertura: `docker compose --profile teste run --rm --no-deps --build api-teste npm run test:unidade`. Integração: `docker compose --profile teste rm -sf db-teste` e depois `docker compose --profile teste run --rm --build api-teste`. Coleção: `npx newman run docs/postman/scoc.postman_collection.json --env-var "senha=<ADMIN_SENHA>"` |
| Última execução | 13/11/2026, entre 00:59 e 01:03 (BRT), na tag `v1.0.3-sprint-6` (commit `31aad37`), com o banco de teste recriado. Unidade: 56 testes em 5 suítes, 56 aprovados e nenhuma falha, com cobertura de 98,33% das instruções, 82,17% dos desvios, 96% das funções e 98,82% das linhas. Integração e sistema: 217 testes em 20 suítes, 217 aprovados e nenhuma falha. Coleção do Postman pelo Newman 6.2.1: 74 requisições e 133 verificações, 133 aprovadas e nenhuma falha. Evidência: `evidencias/2026-11-13-v1.0.3/`. |

## APÊNDICE A, RISCOS QUE AFETAM O TESTE

Riscos da seção 3.5 do replanejamento da Sprint 4, com a situação em 02/11/2026, e os que
apareceram depois. As linhas da concentração em um integrante e do DT06 foram atualizadas em
13/11/2026, ao fim da execução.

Quadro: Riscos que afetam o teste

| Risco | Tipo | Grau | Efeito no teste | Tratamento |
|---|---|---|---|---|
| Concentração do desenvolvimento em um integrante (3.5) | projeto | Alto | Quem escreveu o código também escreveu os testes e fez as verificações de tela; defeito de entendimento passa pelos dois. | Os 64 casos com parte manual foram divididos entre os quatro integrantes por tela (`distribuicao-manual.md`), mas a divisão não se concretizou: os casos de tela foram executados por um único integrante, por automação de navegador (seção 5.3). O ensaio em máquina limpa, que deveria ser de quem não escreveu o README, ficou com o autor (DT08); a ação AM04 (transferir os testes para o responsável por qualidade) segue aberta. |
| Limite diário de requisições das fontes externas (3.5) | produto | Médio | Uma rodada de teste contra a fonte real pode esgotar a cota e falhar por motivo externo. | Testes automatizados com respostas simuladas do Open-Meteo; coleta real a cada 60 min e numa requisição só para os 16 bairros; a verificação manual contra a fonte real é feita uma vez por rodada. |
| Primeira sprint de implementação depois de dois meses só de documentação (3.5) | projeto | Encerrado | — | Superado: a velocidade foi medida nas Sprints 4 e 5. |
| DT05: sem automação de interface | produto | Alto | Os critérios de tela (mapa, faixa grave, formulários, botões por perfil) só têm verificação manual, que não se repete a cada mudança. | Casos de tela marcados como manuais, com passos e evidência por captura; regressão de tela no fim da execução, depois das correções. |
| DT06: sem revisão cruzada | projeto | Alto | Nenhum item teve leitura de código por outro integrante, e os PRs da Sprint 6 foram mesclados sem revisão em 27/10; o teste é a única barreira. | Execução dos casos manuais por outros integrantes, planejada em `distribuicao-manual.md`, que não se concretizou (seção 5.3): o teste foi executado pelo autor do código, e o risco continua aberto (seção 5.4). O DT06 segue registrado. |
| DT07: suítes acopladas pela ordem de execução | produto | Médio | Com o banco de teste reaproveitado, duas suítes falham por dados de rodadas anteriores (US12-ruído e US10-3), o que pode ser lido como regressão. | Toda rodada oficial recria o banco de teste antes de rodar; falha intermitente é comparada primeiro com o DT07, antes de virar incidente. |
| DT08: ensaio em máquina limpa sem independência | projeto | Alto | Lacunas no manual de instalação podem não ser detectadas, porque o CT-005 é executado pelo próprio autor do README. O leitor novo do manual é o avaliador do trabalho: uma lacuna não detectada impede a execução do projeto por quem avalia. | O CT-005 continua verificando a subida pelo Compose numa máquina sem Node e sem PostgreSQL; a execução por um leitor novo fica para a próxima entrega (DT08). |
| Escopo ainda em revisão no corte | projeto | Encerrado | — | Superado: no corte de 31/10 todos os itens do escopo estendido estavam na `main`, conferidos com a tag em 02/11. |
| Verificação de tela em navegador fora da máquina do ambiente | projeto | Baixo | Em 27/10, o navegador disponível para a verificação assistida não alcançava o `localhost` da máquina do ambiente. | Execução manual no Chrome da própria máquina que sobe o ambiente. |
