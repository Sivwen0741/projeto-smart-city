# Distribuição dos casos de execução manual

São 64 casos com parte manual (7 só manuais e 57 com a interface de programação já automatizada e a tela manual), agrupados pela tela em que são executados, para dividir entre os quatro integrantes. A especificação de cada caso está em [`casos-de-teste.md`](casos-de-teste.md).

As estimativas incluem preparar os dados do caso, executar, conferir o resultado e salvar a captura de tela da evidência. Não incluem subir o ambiente (cerca de 10 min por máquina, uma vez) nem o registro de incidentes.

## Resumo por grupo

| Grupo | Casos | Só manuais | Prioridade alta | Escopo estendido | Estimativa |
|---|---|---|---|---|---|
| Ambiente e repositório | 4 | 2 | 3 | 0 | 2 h 05 min |
| Login e sessão | 1 | 0 | 1 | 0 | 5 min |
| Mapa e painel | 11 | 3 | 4 | 4 | 1 h 25 min |
| Alertas e faixa grave | 13 | 0 | 8 | 2 | 1 h 55 min |
| Ocorrências | 12 | 0 | 5 | 8 | 1 h 35 min |
| Dispositivos e histórico | 6 | 0 | 1 | 4 | 45 min |
| Regras de alerta | 5 | 0 | 3 | 2 | 40 min |
| Rios | 2 | 0 | 0 | 2 | 15 min |
| Usuários e perfis | 2 | 0 | 2 | 2 | 35 min |
| Busca do cabeçalho | 3 | 0 | 0 | 3 | 20 min |
| Publicação MQTT nas fronteiras | 4 | 1 | 0 | 2 | 55 min |
| Elementos do backlog | 1 | 1 | 0 | 0 | 10 min |
| **Total** | **64** | **7** | **27** | **29** | **10 h 45 min** |

Divididos igualmente, são cerca de 2,7 h por integrante. O ensaio em máquina limpa (CT-005) precisa ser de quem não escreveu o README, e o grupo de usuários e perfis precisa de um administrador e de quatro usuários de teste.

## Casos por grupo

### Ambiente e repositório — 4 casos, cerca de 2 h 05 min

Preparação: Máquina com Docker; para o CT de máquina limpa, um computador de outro integrante, sem Node nem PostgreSQL.

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-001 | TT01 | Subir todo o ambiente com um único comando | alta | automatizado e manual | Subida pelo Compose e serviços saudáveis. | 15 |
| CT-004 | TT01 | Versionar só o exemplo de variáveis de ambiente, sem credencial real | alta | manual | Inspeção do repositório. | 10 |
| CT-005 | TT01 | Executar o projeto numa máquina limpa seguindo só o README, por quem não escreveu o manual | alta | manual | Ensaio em máquina limpa por outro integrante. | 90 |
| CT-033 | TT02 | Subir o simulador com o Compose, publicando as leituras dos exemplos | média | automatizado e manual | Simulador em execução e dispositivos operando na tela. | 10 |

### Login e sessão — 1 caso, cerca de 5 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-006 | US20 | Exigir e-mail funcional e senha em toda rota, exceto as públicas | alta | automatizado e manual | Login pela tela e redirecionamento para o painel. | 5 |

### Mapa e painel — 11 casos, cerca de 1 h 25 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-034 | US01 | Mostrar os dispositivos não inativos no mapa com a cor da legenda | alta | automatizado e manual | Cores e legenda na tela. | 10 |
| CT-035 | US01 | Mostrar as ocorrências abertas com marcador próprio | alta | automatizado e manual | Marcador de ocorrência na tela. | 5 |
| CT-036 | US01 | Mostrar o resumo ao clicar no marcador | alta | automatizado e manual | Balão de resumo na tela. | 5 |
| CT-037 | US01 | Desenhar limites e nomes dos bairros a partir da base territorial | média | automatizado e manual | Desenho dos bairros na tela. | 5 |
| CT-038 | US01 | Agrupar marcadores próximos com a contagem | média | manual | Agrupamento na tela. | 10 |
| CT-039 | US01 | Mudar a cor dos marcadores e mostrar ocorrência nova sem recarregar | alta | manual | Atualização do mapa em tempo real. | 10 |
| CT-043 | US02 | Mostrar no painel os mesmos alertas na mesma ordem | média | manual | Comparação das duas telas. | 5 |
| CT-108 | US12 | Calcular os seis indicadores a partir das leituras | média | automatizado e manual | Faixa de indicadores na tela. | 10 |
| CT-109 | US12 | Mostrar valor, unidade, variação e nota, em vermelho com alerta ativo | média | automatizado e manual | Cores do indicador na tela. | 10 |
| CT-111 | US12 | Montar os gráficos de ocorrências a partir das ocorrências registradas | média | automatizado e manual | Gráficos na tela. | 10 |
| CT-112 | US12 | Atualizar o painel em tempo real | média | automatizado e manual | Atualização da tela. | 5 |

### Alertas e faixa grave — 13 casos, cerca de 1 h 55 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-040 | US02 | Listar os alertas ativos com as colunas do protótipo | alta | automatizado e manual | Colunas e visões na tela. | 10 |
| CT-042 | US02 | Calcular os indicadores do topo da tela de alertas | média | automatizado e manual | Indicadores na tela. | 10 |
| CT-044 | US03 | Mostrar o alerta novo em até 2 segundos, sem recarregar | alta | automatizado e manual | Tempo de chegada nas quatro áreas da tela. | 10 |
| CT-047 | US03 | Reconectar sozinho sem perder alerta emitido no intervalo | média | automatizado e manual | Reconexão da tela. | 15 |
| CT-048 | US28 | Encerrar sozinhos só os não graves sem reconhecimento | alta | automatizado e manual | Saída do alerta da lista na tela. | 10 |
| CT-049 | US28 | Mostrar a faixa fixa enquanto houver grave sem reconhecimento | alta | automatizado e manual | Faixa em todas as telas. | 10 |
| CT-050 | US28 | Manter a faixa depois de recarregar, sair e entrar com outro usuário | média | automatizado e manual | Persistência da faixa na tela. | 10 |
| CT-051 | US28 | Manter o grave sem reconhecimento no topo da lista | alta | automatizado e manual | Ordem na tela. | 5 |
| CT-052 | US04 | Exigir a providência no reconhecimento | alta | automatizado e manual | Painel de reconhecimento na tela. | 5 |
| CT-053 | US04 | Gravar usuário, data, hora e providência, e passar a em atendimento | alta | automatizado e manual | Estado de sucesso do painel. | 5 |
| CT-054 | US04 | Recusar o segundo reconhecimento, mesmo simultâneo | alta | automatizado e manual | Estado de recusa do painel. | 10 |
| CT-099 | US10 | Informar no alerta as duas leituras que o compõem | média | automatizado e manual | Composição no painel do alerta. | 10 |
| CT-127 | US18 | Indicar o bairro e a fonte no alerta | média | automatizado e manual | Painel do alerta mostrando a fonte. | 5 |

### Ocorrências — 12 casos, cerca de 1 h 35 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-056 | US05 | Registrar ocorrência com categoria, descrição, localização, gravidade e órgão | alta | automatizado e manual | Formulário de ocorrência na tela. | 10 |
| CT-059 | US05 | Recusar o cadastro sem categoria, gravidade ou localização, ou fora do município | alta | automatizado e manual | Mensagens do formulário. | 10 |
| CT-060 | US05 | Abrir ocorrência a partir de um alerta, que fica vinculado | média | automatizado e manual | Registro a partir do alerta na tela. | 5 |
| CT-061 | US05 | Registrar no log e mostrar a ocorrência no mapa em tempo real | média | automatizado e manual | Marcador novo no mapa. | 10 |
| CT-084 | US06 | Listar as ocorrências com as colunas e as visões do protótipo | média | automatizado e manual | Lista e visões na tela. | 10 |
| CT-085 | US06 | Mostrar no detalhe o histórico do atendimento com os alertas | média | automatizado e manual | Detalhe na tela. | 5 |
| CT-086 | US06 | Registrar providência e mudar a situação | alta | automatizado e manual | Caixa de providência na tela. | 5 |
| CT-087 | US06 | Encerrar com observação obrigatória | alta | automatizado e manual | Encerramento na tela. | 5 |
| CT-088 | US06 | Tirar a encerrada da lista em andamento e do mapa, mantendo a consulta | média | automatizado e manual | Lista e mapa na tela. | 5 |
| CT-089 | US06 | Registrar providência e encerramento no log e em tempo real | média | automatizado e manual | Atualização da segunda sessão. | 10 |
| CT-120 | US21 | Ver as ocorrências de todos e atualizar só as do próprio órgão | alta | automatizado e manual | Detalhe da ocorrência de outro órgão. | 10 |
| CT-128 | US18 | Sugerir o Meio Ambiente ao abrir ocorrência do alerta de poluição | média | automatizado e manual | Formulário preenchido na tela. | 10 |

### Dispositivos e histórico — 6 casos, cerca de 45 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-013 | US22 | Cadastrar dispositivo com todos os campos | alta | automatizado e manual | Formulário da tela e mensagens de campo. | 10 |
| CT-018 | US22 | Listar com as colunas do protótipo e ordenar por qualquer uma | média | automatizado e manual | Colunas e ordenação na tela. | 5 |
| CT-083 | TT02-9 | Identificar na tela os dados do simulador | média | automatizado e manual | Marca "simulado" nas três telas. | 10 |
| CT-129 | US19 | Abrir o gráfico histórico com período de 24 h, 7 dias ou 30 dias | média | automatizado e manual | Tela do histórico. | 10 |
| CT-130 | US19 | Mostrar a linha do limite das regras ativas | média | automatizado e manual | Linhas tracejadas no gráfico. | 5 |
| CT-131 | US19 | Mostrar o minigráfico das últimas 3 h | baixa | automatizado e manual | Barrinha na tela. | 5 |

### Regras de alerta — 5 casos, cerca de 40 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-020 | US23 | Cadastrar regra com nome, grandeza, operador, limite, duração e gravidade | alta | automatizado e manual | Formulário de regra na tela. | 10 |
| CT-024 | US23 | Impedir salvar com limite vazio, operador não escolhido ou duração negativa | alta | automatizado e manual | Bloqueio do botão e mensagens na tela. | 10 |
| CT-069 | US23 | Duração mínima: −1 é recusada e 0 é aceita | média | automatizado e manual | Recusa de −1 (o teste automatizado usa −5, da mesma classe). | 5 |
| CT-090 | US07 | Avisar quando um dispositivo ativo parar de enviar dados | alta | automatizado e manual | Regra de sistema marcada na tela de regras. | 5 |
| CT-100 | US10 | Ajustar os limites da regra de enchente pela tela | média | automatizado e manual | Bloco de três campos no formulário. | 10 |

### Rios — 2 casos, cerca de 15 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-095 | US09 | Mostrar cada ponto do rio com nível, tendência, série e vazão | média | automatizado e manual | Cartões dos rios na tela. | 10 |
| CT-096 | US09 | Atualizar a tela dos rios em tempo real | média | automatizado e manual | Atualização da tela. | 5 |

### Usuários e perfis — 2 casos, cerca de 35 min

Preparação: Os quatro usuários de perfil criados no começo do grupo, um por perfil, e um de órgão diferente.

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-118 | US21 | Cadastrar, editar e inativar usuários, sem excluir | alta | automatizado e manual | Tela de usuários e senha provisória. | 15 |
| CT-119 | US21 | Recusar com 403 o que o perfil não permite | alta | automatizado e manual | Botões e aba por perfil. | 20 |

### Busca do cabeçalho — 3 casos, cerca de 20 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-114 | US26 | Buscar por protocolo, endereço, bairro e código de dispositivo | média | automatizado e manual | Lista sob a caixa na tela. | 10 |
| CT-115 | US26 | Agrupar os resultados e abrir o detalhe | média | automatizado e manual | Navegação pelo teclado e abertura do detalhe. | 5 |
| CT-117 | US26 | Mínimo de três caracteres na busca | média | automatizado e manual | Aviso de mínimo na tela. | 5 |

### Publicação MQTT nas fronteiras — 4 casos, cerca de 55 min

Preparação: Terminal com `mosquitto_pub` (ou `docker compose exec mosquitto mosquitto_pub`), além da tela.

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-070 | TT02 | Duração mínima de 10 min: em t0 + 5 não dispara, em t0 + 10 dispara | média | automatizado e manual | Borda exata em t0 + 9 min 59 s, que o teste automatizado não cobre. | 15 |
| CT-071 | US23 | Operador na fronteira: leitura igual ao limite | média | automatizado e manual | Publicação MQTT ponta a ponta, que inclui o encerramento por normalização, feito em SQL. | 15 |
| CT-107 | US09 | Cota do rio na fronteira: nível igual à cota | média | manual | Publicação MQTT e conferência na tela dos rios. | 15 |
| CT-126 | US18 | Aplicar as regras de PM2.5 e PM10 às leituras do Open-Meteo de cada bairro | média | automatizado e manual | Coleta real uma vez por rodada, contra a fonte. | 10 |

### Elementos do backlog — 1 caso, cerca de 10 min

| ID | História | Objetivo | Prioridade | Execução | O que se verifica à mão | Min |
|---|---|---|---|---|---|---|
| CT-082 | US08, US16, US25 | Manter desabilitados, com a marca "backlog", os elementos das histórias de prioridade baixa | baixa | manual | Inspeção das telas. | 10 |

## Divisão

| Integrante | Grupos | Estimativa |
|---|---|---|
| Bryan Charles | | |
| Guilherme Eidam | | |
| Guilherme Sartori | | |
| Taynah Cruz | | |
