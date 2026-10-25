# Smart City Operations Center

Plataforma web de supervisão urbana concebida como centro integrado de operações para a Prefeitura de Ponta Grossa (PR). O sistema reúne em um único painel os sensores, câmeras, semáforos e estações ambientais distribuídos pela cidade, gera alertas automáticos classificados por gravidade e acompanha cada ocorrência da detecção até a resolução.

Projeto da disciplina Experiência Profissional: Fábrica de Software, do curso de Engenharia de Software do Centro Universitário de Maringá (UniCesumar), unidade Ponta Grossa.

## O problema

Seis órgãos municipais guardam hoje, cada um do seu jeito, a informação da mesma cidade. O evento costuma chegar ao poder público pela ligação do cidadão, quando o problema já está instalado. Sem critério único de gravidade, a equipe atende quem ligou primeiro e não o caso mais grave. A mesma ocorrência é registrada duas vezes por órgãos diferentes, sem vínculo entre os registros, e não existe histórico comparável que permita medir reincidência por região ou avaliar se a intervenção resolveu.

Ponta Grossa é o quarto município do Paraná, com 358.371 habitantes segundo o Censo de 2022.

## Escopo

| Dentro do escopo | Fora do escopo |
|---|---|
| Cadastro de bairros, sensores, câmeras, semáforos, estações, usuários e perfis | Transmissão, gravação e armazenamento de vídeo das câmeras |
| Ingestão por MQTT, coletores agendados e simulador próprio | Reconhecimento facial e leitura automática de placas |
| Painel com mapa, indicadores, gráficos históricos, mapa de calor e filtros | Comando remoto de semáforos e da iluminação pública |
| Gestão de ocorrências, da detecção até a resolução | Compra e instalação dos sensores físicos em campo |
| Motor de alertas com regras configuráveis e reconhecimento pelo operador | Aplicativo móvel e canal de atendimento ao cidadão |
| Relatórios em PDF, controle de acesso por perfil e log de atividades | Implantação em produção real, com redundância e contingência |

Previsão por inteligência artificial permanece no backlog, fora da entrega atual.

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/sprint-1.md`](docs/sprint-1.md) | Cinco personas e as 24 histórias que formam o product backlog |
| [`docs/Modelagem_Estrutural_e_de_Dados.pdf`](docs/Modelagem_Estrutural_e_de_Dados.pdf) | Memorial dos dois modelos e o quadro de correspondência entre eles |
| [`docs/diagrama-classes.png`](docs/diagrama-classes.png) | Diagrama de classes UML, com 17 classes |
| [`docs/diagrama-der.png`](docs/diagrama-der.png) | Diagrama entidade-relacionamento |
| [`docs/Seminario_Smart_City.pdf`](docs/Seminario_Smart_City.pdf) | Apresentação do seminário, incluindo arquitetura e telas do protótipo |
| [`docs/Sprint_4_Replanejamento.pdf`](docs/Sprint_4_Replanejamento.pdf) | Retrospectiva, backlog revisado e planejamento da Sprint 4 |
| [`docs/Documento_de_Visao.pdf`](docs/Documento_de_Visao.pdf) | Objetivos, escopo e fora do escopo do projeto |
| [`docs/verificacao-sprint-4.md`](docs/verificacao-sprint-4.md) | Critérios de aceite da Sprint 4 e o teste ou a evidência de cada um |
| [`docs/decisoes/`](docs/decisoes/) | Registros das decisões de arquitetura e de modelagem |

Os arquivos `.drawio` na mesma pasta são as versões editáveis dos diagramas, abertas em [diagrams.net](https://app.diagrams.net).

## Decisões de modelagem

A hierarquia de dispositivos é resolvida no banco por tabela única, com discriminador e um campo `jsonb` para os atributos próprios de cada tipo. A alternativa seriam quatro tabelas de estrutura quase idêntica, que complicariam a consulta que lista todos os equipamentos de um bairro e exigiriam mudança de esquema a cada novo tipo de dispositivo.

A configuração do alerta e a ocorrência do alerta são classes separadas. `RegraAlerta` guarda a grandeza observada, o operador de comparação, o limite, a duração mínima e o nível de criticidade; `Alerta` guarda a violação concreta dessa regra. É o que permite ajustar a sensibilidade do sistema pelo cadastro, sem alteração de código.

Um alerta pode apontar para uma ocorrência já aberta. Assim, quando a mesma enchente dispara sensores de vários pontos da região, as equipes de campo tratam tudo como um evento só.

Posição geográfica usa os tipos espaciais do PostGIS: `geography` para dispositivos e ocorrências, adequado à consulta por raio, e `geometry` para a área dos bairros. Os filtros por bairro e o mapa de calor são executados no próprio banco.

## Tecnologias

| Camada | Escolha | Motivo |
|---|---|---|
| Interface | React com Vite e TypeScript | Painel denso, com tipo compartilhado entre as duas pontas |
| Serviço | NestJS sobre Node.js | Módulos e injeção de dependência materializam a arquitetura em camadas |
| Persistência | PostgreSQL com PostGIS | Consulta espacial por bairro e por raio executada no banco |
| Ingestão | MQTT com Mosquitto | Protocolo de fato em IoT, compatível com sensor real |
| Tempo real | Socket.IO | O alerta aparece na tela sem o operador recarregar a página |
| Mapa | Leaflet com OpenStreetMap | Base livre, com agrupamento de marcadores e mapa de calor |

## Fontes de dados

A plataforma consome dados reais sempre que existe fonte pública para a variável: **Open-Meteo** para qualidade do ar, previsão do tempo e vazão fluvial; **TomTom Traffic** para fluxo de veículos e incidentes de trânsito; **IBGE Localidades** para a base territorial do município; e **OpenStreetMap** para malha viária, semáforos e pontos de iluminação já mapeados. Ruído, ocupação de vagas e consumo não têm fonte pública aberta e vêm do simulador desenvolvido pela equipe.

## Como executar

O ambiente inteiro sobe com Docker Compose. A máquina precisa apenas do
[Docker](https://docs.docker.com/get-docker/) com o Compose v2 (Docker Desktop já inclui) e do Git.
Node.js e PostgreSQL não precisam estar instalados. O Docker Desktop precisa estar aberto antes dos
comandos abaixo; no macOS, ele pode pedir a senha de administrador na primeira abertura. No Windows,
use o PowerShell: os comandos são os mesmos.

1. Clone o repositório e entre na pasta:

   ```sh
   git clone https://github.com/Sivwen0741/projeto-smart-city.git
   cd projeto-smart-city
   ```

2. Crie o arquivo de variáveis a partir do exemplo e troque os valores, principalmente a senha
   do banco, o `JWT_SEGREDO` e a senha do administrador:

   ```sh
   cp .env.example .env
   ```

   O `JWT_SEGREDO` precisa ter ao menos 32 caracteres. Não use `$` nos valores, porque o Docker
   Compose o interpreta como variável. Para gerar valores seguros:

   ```sh
   openssl rand -hex 32
   ```

   Na primeira subida é criado um usuário administrador com o `ADMIN_EMAIL` e a `ADMIN_SENHA`
   do `.env`. Use essas credenciais para entrar na interface web. Se o e-mail já existir, o
   usuário não é alterado.

3. Suba tudo:

   ```sh
   docker compose up --build
   ```

   A primeira subida baixa as imagens e compila a aplicação, o que leva alguns minutos. A
   interface de programação aplica as migrações e a carga inicial antes de aceitar requisições,
   e a interface web só sobe depois que ela responde. O ambiente está pronto quando o log mostrar:

   ```text
   api-1  | migração aplicada: ...
   api-1  | território carregado: 5 distritos, 16 bairros
   api-1  | usuário administrador inicial criado: admin@pontagrossa.pr.gov.br
   api-1  | dispositivos de exemplo carregados: 13
   api-1  | regras de alerta de exemplo carregadas: 7
   api-1  | ... [IngestaoService] conectado ao broker, assinando scoc/dispositivos/+/leituras
   simulador-1  | simulador conectado a mqtt://mosquitto:1883: 10 dispositivos a cada 30 s
   ```

   Nas subidas seguintes, a carga inicial só mostra a linha do território. Para deixar o
   terminal livre, use `docker compose up --build -d` e acompanhe com `docker compose logs -f api`.

4. Abra <http://localhost:8080> e entre com o `ADMIN_EMAIL` e a `ADMIN_SENHA` do `.env`. A tela
   inicial é o painel, com o mapa da cidade.

| Serviço | Endereço |
|---|---|
| Interface web | <http://localhost:8080> |
| Documentação Swagger, com todas as rotas | <http://localhost:3000/api/docs> |
| Rotas da interface de programação | `http://localhost:3000/api/...`, por exemplo `/api/dispositivos` |
| Verificação de saúde | <http://localhost:3000/api/health> |
| Broker MQTT (Mosquitto) | `localhost:1883` |
| PostgreSQL com PostGIS | `localhost:5432` |

As portas publicadas ficam restritas ao `localhost`. Se alguma já estiver em uso, defina outra no
`.env` (`WEB_PORTA_LOCAL`, `API_PORTA_LOCAL`, `MQTT_PORTA_LOCAL`, `DB_PORTA_LOCAL`).

Para parar, use `docker compose down`. Para apagar também o banco e recomeçar do zero, use
`docker compose down -v`.

O nome do projeto é fixo (`scoc`), então qualquer cópia do repositório na mesma máquina usa o
mesmo banco. O PostgreSQL só aplica a senha do `.env` quando o banco é criado. Se você já subiu o
projeto antes, ou trocou `DB_PASSWORD` depois da primeira subida, a interface de programação para
com `password authentication failed`. Nesse caso, rode `docker compose down -v` e suba de novo.

### Usar a interface de programação (Swagger ou Postman)

Todas as rotas, exceto o login e a verificação de saúde, exigem token.

1. Faça o login com o administrador do `.env`:

   ```sh
   curl -X POST http://localhost:3000/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email": "admin@pontagrossa.pr.gov.br", "senha": "a ADMIN_SENHA do .env"}'
   ```

   A resposta traz o campo `token`, que vale por oito horas. No Swagger, o mesmo login está em
   `POST /api/auth/login`, com o botão "Try it out".

2. No Swagger, clique em **Authorize** e cole só o valor do token, sem a palavra `Bearer`. No
   Postman, use a aba **Authorization**, tipo **Bearer Token**.

Para o Postman, há uma coleção com todas as rotas e os testes de cada uma em
[`docs/postman/scoc.postman_collection.json`](docs/postman/scoc.postman_collection.json). Importe a coleção, preencha a variável `senha` com a
`ADMIN_SENHA` do `.env` e use **Run collection**: o login guarda o token para as demais.

A primeira subida carrega dispositivos e regras de exemplo.

### Leituras dos dispositivos (MQTT)

Os dispositivos enviam leituras ao Mosquitto, no tópico `scoc/dispositivos/{código}/leituras`. A
interface de programação grava cada leitura, atualiza a última comunicação do dispositivo e
avalia as regras de alerta. Uma mensagem `{}` é só sinal de vida.

O serviço `simulador` publica, a cada 30 s, as leituras dos dispositivos de exemplo, com
episódios que cruzam os limites das regras de exemplo. Cerca de 13 minutos depois da subida, a
cheia simulada do Arroio Olarias gera o primeiro alerta grave. EA-07 e SN-027 não publicam e
ficam sem comunicação de propósito. Os episódios estão em
[`docs/decisoes/2026-10-24-ingestao-mqtt.md`](docs/decisoes/2026-10-24-ingestao-mqtt.md).

Para publicar uma leitura à mão, com o ambiente de pé:

```sh
docker compose exec mosquitto mosquitto_pub -q 1 -t scoc/dispositivos/SN-027/leituras \
  -m '{"leituras": [{"grandeza": "nivel_agua", "valor": 2.4}]}'
```

Mensagem de dispositivo não cadastrado ou inativo, ou com grandeza que o tipo não mede, é
descartada e aparece no log (`docker compose logs api`) como `mensagem descartada de ...`.

### Testes automatizados

Os testes e2e rodam dentro de contêineres, contra um banco PostGIS e um broker MQTT descartáveis:

```sh
docker compose --profile teste run --rm --build api-teste
```

Cada teste traz no nome o número do critério de aceite que verifica (por exemplo, `TT01-3`). A
relação entre critérios e testes está em
[`docs/verificacao-sprint-4.md`](docs/verificacao-sprint-4.md).

O banco de teste continua de pé depois do comando, e uma nova rodada reaproveita os dados da
anterior. Para rodar contra um banco vazio, apague-o antes:

```sh
docker compose --profile teste rm -sf db-teste
```

### Base territorial

Distritos e bairros vêm de arquivos GeoJSON versionados em
`api/src/database/seeds/territorio/`, gerados a partir da API de Localidades do IBGE e do
OpenStreetMap. A subida não acessa a internet para isso. Para regerar os arquivos (exige Node.js
24 ou mais recente e acesso à internet):

```sh
cd api && npm ci && npm run territorio:atualizar
```

O motivo da decisão está em
[`docs/decisoes/2026-10-20-bairros-ibge-osm.md`](docs/decisoes/2026-10-20-bairros-ibge-osm.md).

### Cadastro de dispositivos

A aba Dispositivos lista os equipamentos e abre o formulário de cadastro e edição no painel
lateral. O bairro sai da coordenada marcada no mapa, por consulta espacial; ponto na zona rural
fica sem bairro, e ponto fora do município é recusado. Dispositivo não é excluído, só inativado.

Os campos próprios de cada tipo e a regra de "Sem comunicação" estão em
[`docs/decisoes/2026-10-22-atributos-por-tipo.md`](docs/decisoes/2026-10-22-atributos-por-tipo.md)
e [`docs/decisoes/2026-10-22-situacao-sem-comunicacao.md`](docs/decisoes/2026-10-22-situacao-sem-comunicacao.md).
As rotas estão no Swagger, na seção `dispositivos`.

### Regras de alerta

A aba Regras cadastra os limites que disparam alertas: grandeza observada, operador, valor
limite, duração mínima e gravidade. Uma regra vale para todos os dispositivos que medem a
grandeza. Ela não é excluída, só desativada, e cada alteração fica registrada com o valor
anterior e o novo. Os motivos estão em
[`docs/decisoes/2026-10-22-regras-de-alerta.md`](docs/decisoes/2026-10-22-regras-de-alerta.md).

Os limites das regras de exemplo são ilustrativos e precisam ser validados com os órgãos antes de
qualquer uso real.

## Situação

A Sprint 4 é a primeira sprint de implementação. Os itens em andamento e seus critérios de aceite
estão em [`docs/Sprint_4_Replanejamento.pdf`](docs/Sprint_4_Replanejamento.pdf).

As tarefas são acompanhadas no [quadro Kanban da equipe](https://trello.com/b/tzN6oUT8).

## Equipe

| Integrante | Atribuição |
|---|---|
| Bryan Charles | Desenvolvimento backend e frontend |
| Guilherme Eidam | Documentação |
| Guilherme Sartori | Testes e qualidade |
| Taynah Cruz | Gerência de projeto |
