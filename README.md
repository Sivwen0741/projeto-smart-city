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

## Situação

A Sprint 1, com personas e product backlog, e a modelagem estrutural e de dados estão entregues. A implementação ainda não começou, de modo que este repositório concentra, por enquanto, os artefatos de documentação.

As tarefas são acompanhadas no [quadro Kanban da equipe](https://trello.com/b/tzN6oUT8).

## Equipe

| Integrante | Atribuição |
|---|---|
| Bryan Charles | Desenvolvimento backend e frontend |
| Guilherme Eidam | Documentação |
| Guilherme Sartori | Testes e qualidade |
| Taynah Cruz | Gerência de projeto |
