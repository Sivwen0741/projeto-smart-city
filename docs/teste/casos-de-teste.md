# Especificação dos casos de teste — Smart City Operations Center

Casos da seção 2 do modelo de documentação de teste, derivados do [plano](plano-de-teste.md). Cada caso indica a história de origem e a técnica, e cita o teste automatizado que o cobre (arquivo em `api/test/` › nome do caso), o que liga esta seção à seção 6 do modelo.

O documento traz as duas formas: a tabela da seção 2 do modelo, com as colunas dele, e, abaixo, uma ficha por caso com os campos da ficha de caso de teste da aula (identificador, objetivo, prioridade e técnica, rastreabilidade, pré-condições, entradas e passos, resultado esperado e execução). O campo "Na execução" fica em branco até o checkpoint 2.

## Pré-condição comum

Versão testada: a tag do corte (`v1.0-sprint-6`). Casos com execução manual: ambiente completo no ar pelo `docker compose up` a partir de um clone da tag, com o `.env` copiado do `.env.example`, Chrome na mesma máquina e, quando o caso diz, o administrador do `.env` autenticado. Casos automatizados: suíte do perfil `teste` do Compose num banco de teste recriado (seção 1.4 do plano).

## Resumo

| | Núcleo | Estendido | Total |
|---|---|---|---|
| Casos | 82 | 57 | 139 |
| Prioridade alta | 54 | 24 | 78 |
| Só automatizado | 47 | 28 | 75 |
| Automatizado e manual (API automatizada, tela manual) | 29 | 28 | 57 |
| Só manual | 6 | 1 | 7 |

Os casos do escopo estendido só valem para os itens que estiverem na `main` no corte de 31/10/2026; os demais passam a "fora do escopo" na revisão de 01/11 (seção 1.1 do plano).

## Tabela da seção 2 do modelo

Mesmas colunas do modelo. Na coluna História, US e TT são a numeração do projeto (histórias de usuário e tarefas técnicas), no lugar do "HU-__" do modelo. Pré-condições, teste automatizado, forma de execução e o campo "Na execução", que vêm da ficha de caso de teste da aula e não cabem na tabela do modelo, estão nas fichas mais abaixo.

| ID | História | Objetivo | Prioridade | Técnica | Entradas e passos | Resultado esperado |
|---|---|---|---|---|---|---|
| CT-001 | TT01 | Subir todo o ambiente com um único comando | alta | Particionamento (classe válida) | Executar `docker compose up -d`; aguardar; executar `docker compose ps`; abrir `http://localhost:8080` e `http://localhost:3000/api/health`. | Banco PostGIS, Mosquitto, interface de programação, interface web e simulador em execução e saudáveis; a tela de login abre; o health responde 200 com o banco disponível. |
| CT-002 | TT01 | Criar o esquema por migração versionada, sem comando manual | alta | Particionamento (classe válida) | Subir o banco vazio; consultar a tabela `migracao`; subir de novo. | Todas as migrações de `api/src/database/migrations/` aplicadas na primeira subida; a segunda subida não reaplica migração nem duplica a carga. |
| CT-003 | TT01 | Carregar a base territorial de Ponta Grossa | média | Particionamento (classe válida) | Consultar `distrito` e `bairro`; localizar um ponto conhecido de um bairro. | 5 distritos com o código do IBGE e 16 bairros do OpenStreetMap, cada um dentro de um distrito; a consulta espacial devolve o bairro do ponto. Desvio registrado: o IBGE não tem bairros (`2026-10-20-bairros-ibge-osm.md`). |
| CT-004 | TT01 | Versionar só o exemplo de variáveis de ambiente, sem credencial real | alta | Particionamento (classes válida e inválidas) | Executar `git ls-files | grep -i env`; `git log --all -- .env`; buscar senha, segredo e token literais no código. | Só `.env.example` versionado; `.env` nunca entrou no histórico; nenhuma credencial real no código. |
| CT-005 | TT01 | Executar o projeto numa máquina limpa seguindo só o README, por quem não escreveu o manual | alta | Particionamento (classe válida) | Seguir a seção "Como executar" do README do início ao fim, sem ajuda. | O ambiente sobe, o login do administrador funciona e o painel abre com os dispositivos de exemplo. Pendente desde a Sprint 4 (DT06). |
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
| CT-127 | US18 | Indicar o bairro e a fonte no alerta | média | Particionamento (classe válida) | Disparar alerta de poluição de bairro; abrir em Alertas. | Sem dispositivo, com "Open-Meteo", o bairro e a fonte "Open-Meteo Air Quality API"; no mapa, dentro do bairro. |
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

## Modelos das técnicas

### Tabela de decisão do disparo pelas regras de alerta (TT02-4, TT02-6, US23)

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

### Tabela de decisão do risco de enchente (US10)

| Condição ou ação | E1 | E2 | E3 | E4 | E5 | E6 |
|---|---|---|---|---|---|---|
| Nível acima da cota | S | S | S | N | S | S |
| Chuva acima do limite no mesmo bairro, dentro da janela | S | N | N | S | N (outro bairro ou fora da janela) | S |
| Vazão prevista acima do limite, dentro da janela | – | S | N | – | N | – |
| Sem alerta ativo da regra para o sensor | S | S | S | S | S | N |
| **Abre alerta** | **sim** | **sim** | não | não | não | não |
| Caso | CT-101 | CT-102 | CT-103 | CT-104 | CT-105 | CT-106 |

### Transição de estados do alerta (US04, US28, US06)

| Estado | Evento | Próximo estado | Caso |
|---|---|---|---|
| aberto | reconhecer com providência | em atendimento | CT-072 |
| em atendimento | reconhecer | recusado, sem mudança | CT-073 |
| encerrado | reconhecer | recusado, sem mudança | CT-074 |
| aberto (atenção ou informativo) | leitura volta ao normal | encerrado | CT-075 |
| aberto (grave) | leitura volta ao normal | aberto | CT-076 |
| em atendimento | leitura volta ao normal | em atendimento | CT-077 |
| em atendimento | encerrar a ocorrência vinculada | encerrado | CT-139 (estendido) |

### Transição de estados da ocorrência (US06, estendido)

| Estado | Evento | Próximo estado | Caso |
|---|---|---|---|
| aberta | primeira providência | em atendimento | CT-133 |
| em atendimento | nova providência | em atendimento | CT-134 |
| aberta ou em atendimento | voltar para aberta | recusado, sem mudança | CT-135 |
| aberta ou em atendimento | encerrar sem observação | recusado, sem mudança | CT-136 |
| aberta ou em atendimento | encerrar com observação | encerrada | CT-137 |
| encerrada | qualquer providência | recusado, sem mudança | CT-138 |

### Valores limite

| Fronteira | Valores testados | Caso |
|---|---|---|
| Duração mínima da regra | −1, 0 | CT-069 |
| Duração mínima de 10 min | t0 + 5 min, t0 + 10 min (e t0 + 9 min 59 s, manual) | CT-070 |
| Operador `>` e `>=` em 3,5 | 3,49, 3,5, 3,51 | CT-071 |
| Cota do rio, 3,5 m | 3,5, 3,51 | CT-107 (estendido) |
| Faixas do IQAr do PM2.5 | 15/16, 50/51, 75/76, 125/126, 300/500; 15,4, 15,5, 16,5 | CT-113 (estendido) |
| Mínimo da busca | 2 caracteres, 2 com espaços, 3 | CT-117 (estendido) |

### Partições de equivalência

| Partição | Classes | Casos |
|---|---|---|
| Situação do dispositivo | operando, sem comunicação, manutenção, inativo | CT-078, CT-079, CT-080, CT-081 |
| Perfil de acesso | consulta, operador, gestor, administrador | CT-122, CT-123, CT-124, CT-125 (estendido) |
| Órgão da ocorrência para quem atualiza | mesmo órgão, outro órgão, sem órgão, administrador | CT-120 (estendido) |

## Casos do núcleo obrigatório

### CT-001 — Subir todo o ambiente com um único comando

| Campo | Valor |
|---|---|
| História | TT01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Máquina com Docker, sem Node nem PostgreSQL; clone da tag do corte; `.env` copiado do `.env.example`. |
| Entradas e passos | Executar `docker compose up -d`; aguardar; executar `docker compose ps`; abrir `http://localhost:8080` e `http://localhost:3000/api/health`. |
| Resultado esperado | Banco PostGIS, Mosquitto, interface de programação, interface web e simulador em execução e saudáveis; a tela de login abre; o health responde 200 com o banco disponível. |
| Teste automatizado | `tt01.e2e-spec.ts` › TT01-1 a interface de programação responde com o banco PostGIS habilitado |
| Execução | automatizado e manual; manual: Subida pelo Compose e serviços saudáveis. Tela: Ambiente e repositório, cerca de 15 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-002 — Criar o esquema por migração versionada, sem comando manual

| Campo | Valor |
|---|---|
| História | TT01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Subir o banco vazio; consultar a tabela `migracao`; subir de novo. |
| Resultado esperado | Todas as migrações de `api/src/database/migrations/` aplicadas na primeira subida; a segunda subida não reaplica migração nem duplica a carga. |
| Teste automatizado | `tt01.e2e-spec.ts` › TT01-2 o esquema é criado por migração versionada<br>`tt01.e2e-spec.ts` › TT01-2 uma nova subida não reaplica migrações nem duplica a carga |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-003 — Carregar a base territorial de Ponta Grossa

| Campo | Valor |
|---|---|
| História | TT01 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Consultar `distrito` e `bairro`; localizar um ponto conhecido de um bairro. |
| Resultado esperado | 5 distritos com o código do IBGE e 16 bairros do OpenStreetMap, cada um dentro de um distrito; a consulta espacial devolve o bairro do ponto. Desvio registrado: o IBGE não tem bairros (`2026-10-20-bairros-ibge-osm.md`). |
| Teste automatizado | `tt01.e2e-spec.ts` › TT01-3 os distritos de Ponta Grossa vêm com o código da API de Localidades do IBGE<br>`tt01.e2e-spec.ts` › TT01-3 os dezesseis bairros do OpenStreetMap estão carregados, cada um dentro de um distrito<br>`tt01.e2e-spec.ts` › TT01-3 a consulta espacial resolve o bairro de um ponto |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-004 — Versionar só o exemplo de variáveis de ambiente, sem credencial real

| Campo | Valor |
|---|---|
| História | TT01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Clone da tag do corte. |
| Entradas e passos | Executar `git ls-files | grep -i env`; `git log --all -- .env`; buscar senha, segredo e token literais no código. |
| Resultado esperado | Só `.env.example` versionado; `.env` nunca entrou no histórico; nenhuma credencial real no código. |
| Teste automatizado | não há |
| Execução | manual; manual: Inspeção do repositório. Tela: Ambiente e repositório, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-005 — Executar o projeto numa máquina limpa seguindo só o README, por quem não escreveu o manual

| Campo | Valor |
|---|---|
| História | TT01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Máquina de outro integrante, sem Node nem PostgreSQL; executor diferente do autor do README. |
| Entradas e passos | Seguir a seção "Como executar" do README do início ao fim, sem ajuda. |
| Resultado esperado | O ambiente sobe, o login do administrador funciona e o painel abre com os dispositivos de exemplo. Pendente desde a Sprint 4 (DT06). |
| Teste automatizado | não há |
| Execução | manual; manual: Ensaio em máquina limpa por outro integrante. Tela: Ambiente e repositório, cerca de 90 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-006 — Exigir e-mail funcional e senha em toda rota, exceto as públicas

| Campo | Valor |
|---|---|
| História | US20 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; token do administrador obtido em `POST /api/auth/login`. |
| Entradas e passos | Entrar pela tela com o administrador; chamar cada rota documentada sem token, com token adulterado e com token válido; abrir `/api/docs` sem token. |
| Resultado esperado | Com credencial válida, abre o painel; sem token ou com token adulterado, 401; com token válido, a rota responde; Swagger e health públicos, como exceção registrada. |
| Teste automatizado | `us20.e2e-spec.ts` › US20-1 autentica com e-mail e senha e acessa rota protegida com o token<br>`us20.e2e-spec.ts` › US20-1 toda rota documentada fora login e health responde 401 sem token<br>`us20.e2e-spec.ts` › US20-1 token adulterado ou assinado com outro segredo é recusado<br>`us20.e2e-spec.ts` › US20-1 a documentação Swagger é pública, como exceção registrada<br>`us20.e2e-spec.ts` › US20-1 requisição de login sem senha é recusada com 400 |
| Execução | automatizado e manual; manual: Login pela tela e redirecionamento para o painel. Tela: Login e sessão, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-007 — Gravar a senha só como hash e verificar no servidor

| Campo | Valor |
|---|---|
| História | US20 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Cadastrar usuário; consultar `usuario.senha_hash`; consultar a resposta do login e do `/api/auth/eu`. |
| Resultado esperado | Hash argon2id no banco, nunca a senha; nenhuma resposta expõe o hash. |
| Teste automatizado | `us20.e2e-spec.ts` › US20-2 o banco guarda hash argon2id, nunca a senha em texto puro<br>`us20.e2e-spec.ts` › US20-2 a resposta da API nunca expõe o hash da senha |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-008 — Responder de forma genérica à credencial inválida

| Campo | Valor |
|---|---|
| História | US20 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe inválida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Login com e-mail inexistente; login com e-mail existente e senha errada. |
| Resultado esperado | As duas tentativas recebem 401 com a mesma mensagem, "E-mail ou senha inválidos.". |
| Teste automatizado | `us20.e2e-spec.ts` › US20-3 e-mail inexistente e senha errada têm a mesma resposta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-009 — Expirar o token em oito horas

| Campo | Valor |
|---|---|
| História | US20 · núcleo |
| Prioridade · técnica | alta · Valor limite |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Emitir token e conferir a expiração; usar token vencido. |
| Resultado esperado | O token vale exatamente 8 h; vencido, é recusado com 401. |
| Teste automatizado | `us20.e2e-spec.ts` › US20-4 o token emitido vale exatamente oito horas<br>`us20.e2e-spec.ts` › US20-4 token vencido é recusado |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-010 — Impedir a autenticação do usuário inativo

| Campo | Valor |
|---|---|
| História | US20 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe inválida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Inativar um usuário; tentar login com a senha correta; usar um token emitido antes da inativação. |
| Resultado esperado | Login recusado com a mensagem genérica; o token anterior deixa de valer. |
| Teste automatizado | `us20.e2e-spec.ts` › US20-5 usuário inativo com a senha correta recebe a mesma mensagem genérica<br>`us20.e2e-spec.ts` › US20-5 o token de um usuário inativado deixa de valer |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-011 — Atualizar o último acesso a cada login bem-sucedido

| Campo | Valor |
|---|---|
| História | US20 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Login com sucesso; login com falha; consultar `usuario.ultimo_acesso`. |
| Resultado esperado | O último acesso muda no sucesso e não muda na falha. |
| Teste automatizado | `us20.e2e-spec.ts` › US20-6 o último acesso muda no login com sucesso e não muda na falha |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-012 — Registrar toda tentativa de acesso no log de atividades

| Campo | Valor |
|---|---|
| História | US20 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Login com sucesso, com senha errada e com e-mail inexistente; consultar `log_atividade`. |
| Resultado esperado | Três registros com data, hora, endereço de origem e resultado; o de e-mail inexistente sem usuário. |
| Teste automatizado | `us20.e2e-spec.ts` › US20-7 sucesso e falha de um usuário existente ficam registrados<br>`us20.e2e-spec.ts` › US20-7 tentativa com e-mail inexistente também é registrada |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-013 — Cadastrar dispositivo com todos os campos

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Dispositivos › Cadastrar dispositivo; preencher código, tipo, descrição, endereço, ponto no mapa, data de instalação e situação; salvar. Repetir sem código, sem tipo e com coordenada inválida. |
| Resultado esperado | Cadastro aceito com todos os campos devolvidos e o bairro calculado; sem código, sem tipo ou com coordenada inválida, recusado com mensagem. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-1 cadastra com todos os campos e devolve cada um deles<br>`us22.e2e-spec.ts` › US22-1 a situação pode ser cadastrada como manutenção ou inativo<br>`us22.e2e-spec.ts` › US22-1 recusa cadastro sem código, sem tipo ou com coordenada inválida<br>`us22.e2e-spec.ts` › US22-1 recusa tipo inexistente<br>`us22.e2e-spec.ts` › US22-1 cadastro sem token é recusado |
| Execução | automatizado e manual; manual: Formulário da tela e mensagens de campo. Tela: Dispositivos e histórico, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-014 — Recusar código identificador repetido

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe inválida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Cadastrar `SN-900`; cadastrar `sn-900`; editar outro dispositivo para `SN-900`; dois cadastros simultâneos com o mesmo código. |
| Resultado esperado | 409 com mensagem que cita o dispositivo existente; nos simultâneos, só um é aceito. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-2 código repetido, mesmo com outra caixa, é recusado com 409 e a mensagem cita o existente<br>`us22.e2e-spec.ts` › US22-2 editar para o código de outro dispositivo também é recusado<br>`us22.e2e-spec.ts` › US22-2 dois cadastros simultâneos com o mesmo código: só um é aceito |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-015 — Gravar a coordenada como geography e calcular o bairro por consulta espacial

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Cadastrar dentro de um bairro, na zona rural e fora do município; tentar informar o bairro; mover o ponto. |
| Resultado esperado | Coluna `geography(Point,4326)`; bairro do polígono que contém o ponto, recalculado ao mover; zona rural sem bairro e com distrito; fora do município, 422; bairro informado é ignorado. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-3 a coluna localizacao é geography(Point,4326)<br>`us22.e2e-spec.ts` › US22-3 o bairro gravado é o que contém a coordenada<br>`us22.e2e-spec.ts` › US22-3 o bairro não pode ser digitado<br>`us22.e2e-spec.ts` › US22-3 mudar a coordenada recalcula o bairro<br>`us22.e2e-spec.ts` › US22-3 ponto na zona rural fica sem bairro e com o distrito calculado<br>`us22.e2e-spec.ts` › US22-3 ponto fora do município é recusado<br>`us22.e2e-spec.ts` › US22-3 a consulta de localização devolve bairro e distrito antes de salvar |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-016 — Gravar os atributos de cada tipo no campo jsonb

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Cadastrar um dispositivo de cada tipo com os atributos próprios; tentar atributo de outro tipo, valor inválido e obrigatório ausente; trocar o tipo. |
| Resultado esperado | Atributos em `atributos_especificos`; recusa com mensagem nos inválidos; troca de tipo exige atributos compatíveis. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-4 cada tipo grava os próprios atributos em atributos_especificos<br>`us22.e2e-spec.ts` › US22-4 os tipos expõem os campos próprios, inclusive os do controlador de iluminação definidos no DT01<br>`us22.e2e-spec.ts` › US22-4 atributo de outro tipo, valor inválido ou obrigatório ausente é recusado<br>`us22.e2e-spec.ts` › US22-4 trocar o tipo exige atributos compatíveis com o novo tipo |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-017 — Inativar sem excluir, mantendo o histórico de leituras

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Inativar um dispositivo com leituras; consultar as leituras; tentar `DELETE`. |
| Resultado esperado | Registro mantido com situação inativo; leituras consultáveis; sem rota de exclusão; inexistente, 404. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-5 não existe rota de exclusão<br>`us22.e2e-spec.ts` › US22-5 inativar mantém o registro e o histórico de leituras<br>`us22.e2e-spec.ts` › US22-5 dispositivo inexistente responde 404 |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-018 — Listar com as colunas do protótipo e ordenar por qualquer uma

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Dispositivos; clicar em cada cabeçalho duas vezes; pedir ordenação desconhecida pela API. |
| Resultado esperado | Código, tipo, localização, situação e última comunicação; ordem crescente e decrescente em cada coluna; ordenação desconhecida, 400. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-6 cada item traz as colunas da listagem<br>`us22.e2e-spec.ts` › US22-6 ordena por código, tipo, localização, situação e comunicação, nos dois sentidos<br>`us22.e2e-spec.ts` › US22-6 ordenação desconhecida é recusada |
| Execução | automatizado e manual; manual: Colunas e ordenação na tela. Tela: Dispositivos e histórico, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-019 — Registrar criação, edição e inativação no log com o autor

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Cadastrar, editar e inativar com dois usuários diferentes; fazer uma operação recusada; consultar `log_atividade`. |
| Resultado esperado | Um registro por operação, com o autor e os valores anterior e novo; a recusada não gera registro. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-7 registra cadastro, edição e inativação com autor e valores anterior e novo<br>`us22.e2e-spec.ts` › US22-7 o autor registrado é quem fez a alteração<br>`us22.e2e-spec.ts` › US22-7 operação recusada não gera registro |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-020 — Cadastrar regra com nome, grandeza, operador, limite, duração e gravidade

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Regras › Cadastrar regra; preencher todos os campos; salvar. Pela API, testar os seis operadores, as três gravidades, grandeza desconhecida e nome vazio. |
| Resultado esperado | Regra salva e listada; os seis operadores e as três gravidades aceitos; grandeza desconhecida, gravidade inválida e nome vazio recusados. |
| Teste automatizado | `us23.e2e-spec.ts` › US23-1 cadastra com todos os campos e devolve cada um deles<br>`us23.e2e-spec.ts` › US23-1 aceita os seis operadores e as três gravidades<br>`us23.e2e-spec.ts` › US23-1 recusa grandeza desconhecida, gravidade inválida e nome vazio<br>`us23.e2e-spec.ts` › US23-1 sem token é recusado |
| Execução | automatizado e manual; manual: Formulário de regra na tela. Tela: Regras de alerta, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-021 — Alterar o valor limite pela interface, sem mudar código

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Editar o limite de uma regra para 4,2, para −1 e para 0; consultar a regra; editar regra inexistente. |
| Resultado esperado | O novo limite vale na hora; decimal, negativo e zero aceitos; inexistente, 404. |
| Teste automatizado | `us23.e2e-spec.ts` › US23-2 o novo limite vale imediatamente na regra gravada<br>`us23.e2e-spec.ts` › US23-2 aceita limite decimal, negativo e zero<br>`us23.e2e-spec.ts` › US23-2 regra inexistente responde 404<br>`unidade/regra.spec.ts` › US23-2 limite negativo e zero |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-022 — Ativar e desativar sem excluir, preservando os alertas

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Desativar e reativar uma regra que já gerou alerta; tentar `DELETE`; cadastrar regra desativada. |
| Resultado esperado | Regra e alertas preservados; sem rota de exclusão; regra pode nascer desativada. |
| Teste automatizado | `us23.e2e-spec.ts` › US23-3 desativar e reativar mantém a regra e os alertas já gerados<br>`us23.e2e-spec.ts` › US23-3 não existe rota de exclusão<br>`us23.e2e-spec.ts` › US23-3 a regra pode nascer desativada |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-023 — Não alterar retroativamente os alertas já emitidos

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Disparar um alerta; mudar operador, limite e gravidade da regra; consultar o alerta. |
| Resultado esperado | O alerta mantém operador, limite e gravidade da época do disparo. |
| Teste automatizado | `us23.e2e-spec.ts` › US23-4 o alerta guarda operador, limite e gravidade da época do disparo |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-024 — Impedir salvar com limite vazio, operador não escolhido ou duração negativa

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe inválida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | No formulário, deixar o limite vazio; depois não escolher operador; depois informar duração −5; tentar salvar em cada caso. Repetir pela API, no cadastro e na edição. |
| Resultado esperado | Botão de salvar desabilitado com a lista do que corrigir; a API recusa com 400 e a mensagem de cada caso, sem alterar a regra. |
| Teste automatizado | `us23.e2e-spec.ts` › US23-5 cadastro recusado com mensagem para cada caso<br>`us23.e2e-spec.ts` › US23-5 edição recusada nos mesmos casos, sem alterar a regra |
| Execução | automatizado e manual; manual: Bloqueio do botão e mensagens na tela. Tela: Regras de alerta, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-025 — Registrar cada alteração de regra com valor anterior e novo

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Cadastrar e editar uma regra; editar sem mudança; fazer edição recusada; abrir o histórico da regra. |
| Resultado esperado | Registro com autor, antes e depois; histórico mostra autor e valores; edição sem mudança e recusada não geram registro. |
| Teste automatizado | `us23.e2e-spec.ts` › US23-6 registra cadastro e cada edição com autor, antes e depois<br>`us23.e2e-spec.ts` › US23-6 o histórico de alterações da regra mostra o autor e os valores<br>`us23.e2e-spec.ts` › US23-6 edição sem mudança e edição recusada não geram registro |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-026 — Gravar cada leitura válida recebida pelo MQTT

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Publicar em `scoc/dispositivos/{código}/leituras` uma leitura de nível e uma mensagem de estação com várias grandezas. |
| Resultado esperado | Leituras gravadas com grandeza, valor, unidade, origem `mqtt` e horário da medição. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-1 grava grandeza, valor, unidade, origem mqtt e o horário da medição<br>`tt02.e2e-spec.ts` › TT02-1 a estação ambiental envia várias grandezas na mesma mensagem |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-027 — Atualizar a última comunicação a cada mensagem aceita

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Publicar para um dispositivo sem comunicação; publicar sinal de vida de câmera e semáforo. |
| Resultado esperado | O dispositivo passa a operando; câmera e semáforo atualizam a comunicação sem gravar leitura. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-2 o dispositivo passa de sem comunicação a operando<br>`tt02.e2e-spec.ts` › TT02-2 câmera e semáforo mandam só sinal de vida, sem leitura |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-028 — Descartar mensagem inválida sem derrubar o assinante

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe inválida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Publicar para código inexistente, para dispositivo inativo, com grandeza que o tipo não mede e com JSON inválido; depois publicar uma leitura válida. |
| Resultado esperado | As inválidas são descartadas e registradas no log da aplicação; a válida seguinte é gravada. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-3 mensagem inválida é descartada sem derrubar o assinante e fica registrada no log |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-029 — Avaliar a leitura contra as regras ativas da mesma grandeza

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Executar as regras R1 a R7 da tabela de decisão do disparo (seção "Modelos das técnicas"). |
| Resultado esperado | O alerta só é emitido quando todas as condições da regra R1 são verdadeiras. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 a condição precisa durar o tempo mínimo da regra, e a duração zero dispara na primeira leitura<br>`tt02.e2e-spec.ts` › TT02-4 uma leitura dentro do limite reinicia a contagem da duração<br>`tt02.e2e-spec.ts` › TT02-4 regra desativada e regra de outra grandeza não disparam<br>`tt02.e2e-spec.ts` › TT02-4 dispositivo em manutenção grava a leitura e não gera alerta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-030 — Gravar no alerta a cópia da regra vigente no disparo

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Disparar um alerta com regra `>=` 300, atenção; consultar o alerta. |
| Resultado esperado | Alerta com regra, dispositivo, leitura, valor observado e cópia de operador, limite e gravidade. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-5 o alerta guarda regra, dispositivo, leitura, valor observado e a cópia de operador, limite e gravidade |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-031 — Não abrir outro alerta da mesma regra e dispositivo enquanto houver um ativo

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Com alerta ativo, publicar mais leituras fora do limite. |
| Resultado esperado | Continua um único alerta ativo. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-6 enquanto o alerta está ativo, novas leituras fora do limite não abrem outro |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-032 — Reconectar sozinho quando o broker cair

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | média · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Derrubar a conexão com o Mosquitto; restabelecer; publicar uma leitura. |
| Resultado esperado | A interface de programação reconecta sem reinício e grava a leitura. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-7 depois de uma queda da conexão com o broker, reconecta sozinho e volta a gravar |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-033 — Subir o simulador com o Compose, publicando as leituras dos exemplos

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar pelo `docker compose up`. |
| Entradas e passos | Subir o ambiente; aguardar 1 min; abrir Dispositivos; consultar as últimas leituras. |
| Resultado esperado | Os 11 dispositivos do simulador passam a operando com leituras de origem `simulador`; a última comunicação dos exemplos só muda pela ingestão. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-6 a subida não renova a última comunicação dos exemplos: só a ingestão a atualiza |
| Execução | automatizado e manual; manual: Simulador em execução e dispositivos operando na tela. Tela: Ambiente e repositório, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-034 — Mostrar os dispositivos não inativos no mapa com a cor da legenda

| Campo | Valor |
|---|---|
| História | US01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir o painel; comparar a cor de cada marcador com a gravidade do alerta ativo e a situação do dispositivo. |
| Resultado esperado | Grave e atenção pela maior gravidade ativa, normal e sem comunicação; inativos fora do mapa. |
| Teste automatizado | `us01.e2e-spec.ts` › US01-1 a cor do marcador sai da maior gravidade entre os alertas ativos<br>`us01.e2e-spec.ts` › US01-1 a listagem informa o estado, para o mapa deixar de fora os inativos |
| Execução | automatizado e manual; manual: Cores e legenda na tela. Tela: Mapa e painel, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-035 — Mostrar as ocorrências abertas com marcador próprio

| Campo | Valor |
|---|---|
| História | US01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Registrar uma ocorrência; abrir o mapa; encerrar outra ocorrência. |
| Resultado esperado | A ocorrência não encerrada aparece com marcador de ocorrência; a encerrada some; a lista exige token. |
| Teste automatizado | `us01.e2e-spec.ts` › US01-2 lista as não encerradas, com coordenada, e deixa de fora as encerradas<br>`us01.e2e-spec.ts` › US01-2 a listagem de ocorrências exige token |
| Execução | automatizado e manual; manual: Marcador de ocorrência na tela. Tela: Mapa e painel, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-036 — Mostrar o resumo ao clicar no marcador

| Campo | Valor |
|---|---|
| História | US01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Clicar num dispositivo e numa ocorrência. |
| Resultado esperado | Dispositivo: código, tipo, bairro, última leitura e situação. Ocorrência: protocolo, categoria, gravidade e situação. |
| Teste automatizado | `us01.e2e-spec.ts` › US01-3 o dispositivo traz código, tipo, bairro, situação e a última leitura<br>`us01.e2e-spec.ts` › US01-3 a ocorrência traz protocolo, categoria, gravidade e situação |
| Execução | automatizado e manual; manual: Balão de resumo na tela. Tela: Mapa e painel, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-037 — Desenhar limites e nomes dos bairros a partir da base territorial

| Campo | Valor |
|---|---|
| História | US01 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir a aba Mapa. |
| Resultado esperado | Os 16 bairros desenhados, cada nome dentro do próprio polígono. |
| Teste automatizado | `us01.e2e-spec.ts` › US01-4 os limites dos bairros vêm da base territorial, com o ponto do rótulo dentro de cada um |
| Execução | automatizado e manual; manual: Desenho dos bairros na tela. Tela: Mapa e painel, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-038 — Agrupar marcadores próximos com a contagem

| Campo | Valor |
|---|---|
| História | US01 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir o mapa no zoom inicial; aproximar sobre o Centro. |
| Resultado esperado | Marcadores próximos agrupados com a contagem; grave e atenção ficam fora dos grupos; o grupo se desfaz ao aproximar. |
| Teste automatizado | não há |
| Execução | manual; manual: Agrupamento na tela. Tela: Mapa e painel, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-039 — Mudar a cor dos marcadores e mostrar ocorrência nova sem recarregar

| Campo | Valor |
|---|---|
| História | US01 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Com o mapa aberto, publicar uma leitura que dispara alerta grave e registrar uma ocorrência em outra aba. |
| Resultado esperado | A cor do marcador e a ocorrência nova aparecem sem recarregar a página. |
| Teste automatizado | não há |
| Execução | manual; manual: Atualização do mapa em tempo real. Tela: Mapa e painel, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-040 — Listar os alertas ativos com as colunas do protótipo

| Campo | Valor |
|---|---|
| História | US02 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Alertas; alternar entre ativos, em atendimento e encerrados hoje. |
| Resultado esperado | Gravidade, regra, dispositivo, bairro, medição com o limite, detecção, órgão (da ocorrência vinculada) e situação; as visões separam os conjuntos. |
| Teste automatizado | `us02.e2e-spec.ts` › US02-1 cada alerta traz gravidade, regra, dispositivo, bairro, medição com limite, detecção, órgão e situação<br>`us02.e2e-spec.ts` › US02-1 o órgão vem da ocorrência vinculada ao alerta<br>`us02.e2e-spec.ts` › US02-1 as visões separam ativos, em atendimento e encerrados hoje |
| Execução | automatizado e manual; manual: Colunas e visões na tela. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-041 — Ordenar por gravidade e, na mesma gravidade, do mais recente

| Campo | Valor |
|---|---|
| História | US02 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Criar alertas informativo, atenção e grave em horários diferentes; listar. |
| Resultado esperado | Grave, atenção e informativo; dentro de cada gravidade, o mais recente primeiro. |
| Teste automatizado | `us02.e2e-spec.ts` › US02-2 a ordem é grave, atenção e informativo, e o mais recente primeiro na mesma gravidade |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-042 — Calcular os indicadores do topo da tela de alertas

| Campo | Valor |
|---|---|
| História | US02 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Alertas e conferir os indicadores com os alertas existentes. |
| Resultado esperado | Ativos, graves sem reconhecimento, em atendimento, encerrados hoje, tempo médio até o reconhecimento, alertas em 24 h e sem comunicação por tipo. |
| Teste automatizado | `us02.e2e-spec.ts` › US02-3 os indicadores contam ativos, graves sem reconhecimento, em atendimento, encerrados, tempo até o reconhecimento e 24 h<br>`us02.e2e-spec.ts` › US02-3 os dispositivos sem comunicação são contados por tipo |
| Execução | automatizado e manual; manual: Indicadores na tela. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-043 — Mostrar no painel os mesmos alertas na mesma ordem

| Campo | Valor |
|---|---|
| História | US02 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Comparar o quadro "Alertas ativos" do painel com a tela de alertas. |
| Resultado esperado | Mesmos alertas, na mesma ordem. |
| Teste automatizado | não há |
| Execução | manual; manual: Comparação das duas telas. Tela: Mapa e painel, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-044 — Mostrar o alerta novo em até 2 segundos, sem recarregar

| Campo | Valor |
|---|---|
| História | US03 · núcleo |
| Prioridade · técnica | alta · Valor limite |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Com a lista, o painel e o mapa abertos, publicar uma leitura que dispara alerta; medir o tempo até aparecer. |
| Resultado esperado | O alerta aparece na lista, no painel, no mapa e no contador do menu em até 2 s. |
| Teste automatizado | `us03.e2e-spec.ts` › US03-1 o alerta novo chega à tela em até 2 segundos depois da leitura que o disparou |
| Execução | automatizado e manual; manual: Tempo de chegada nas quatro áreas da tela. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-045 — Mostrar em tempo real o reconhecimento e o encerramento feitos por outro operador

| Campo | Valor |
|---|---|
| História | US03 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Duas sessões; reconhecer um alerta na primeira. |
| Resultado esperado | A segunda recebe a mudança de situação sem recarregar. |
| Teste automatizado | `us03.e2e-spec.ts` › US03-2 a mudança de situação feita por outro operador também chega em tempo real<br>`us04.e2e-spec.ts` › US03-2 o reconhecimento feito por um operador chega aos outros em tempo real |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-046 — Exigir o token na conexão em tempo real

| Campo | Valor |
|---|---|
| História | US03 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Conectar ao Socket.IO sem token, com token adulterado, com token de usuário inativo e com token válido. |
| Resultado esperado | Recusada nos três primeiros; aceita com token válido. |
| Teste automatizado | `us03.e2e-spec.ts` › US03-3 sem token, com token adulterado ou de usuário inativo, a conexão é recusada<br>`us03.e2e-spec.ts` › US03-3 com token válido, a conexão é aceita |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-047 — Reconectar sozinho sem perder alerta emitido no intervalo

| Campo | Valor |
|---|---|
| História | US03 · núcleo |
| Prioridade · técnica | média · Transição de estados |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Derrubar a conexão da tela (parar a interface de programação por 10 s); disparar um alerta logo após voltar. |
| Resultado esperado | A tela reconecta e a lista traz o alerta emitido enquanto estava desconectada. |
| Teste automatizado | `us03.e2e-spec.ts` › US03-4 o alerta emitido com a tela desconectada está na lista consultada ao reconectar |
| Execução | automatizado e manual; manual: Reconexão da tela. Tela: Alertas e faixa grave, cerca de 15 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-048 — Encerrar sozinhos só os não graves sem reconhecimento

| Campo | Valor |
|---|---|
| História | US28 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Executar as transições T4 a T6 do alerta (seção "Modelos das técnicas"); conferir na tela a saída do alerta de atenção. |
| Resultado esperado | Atenção e informativo sem reconhecimento encerram ao normalizar; grave nunca; reconhecido não; vale o limite copiado no disparo. |
| Teste automatizado | `us28.e2e-spec.ts` › US28-1 atenção e informativo sem reconhecimento são encerrados quando a leitura volta ao normal<br>`us28.e2e-spec.ts` › US28-1 o alerta grave sem reconhecimento nunca é encerrado automaticamente<br>`us28.e2e-spec.ts` › US28-1 o alerta já reconhecido não é encerrado pela normalização<br>`us28.e2e-spec.ts` › US28-1 a normalização usa o limite copiado no disparo, não o da regra editada |
| Execução | automatizado e manual; manual: Saída do alerta da lista na tela. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-049 — Mostrar a faixa fixa enquanto houver grave sem reconhecimento

| Campo | Valor |
|---|---|
| História | US28 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Disparar um alerta grave; navegar por todas as telas; reconhecer o alerta. |
| Resultado esperado | Faixa em todas as telas autenticadas, com a quantidade e o acesso ao mais antigo, sem botão de fechar; some ao reconhecer. |
| Teste automatizado | `us28.e2e-spec.ts` › US28-2 o resumo informa a quantidade e o grave sem reconhecimento mais antigo, para a faixa |
| Execução | automatizado e manual; manual: Faixa em todas as telas. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-050 — Manter a faixa depois de recarregar, sair e entrar com outro usuário

| Campo | Valor |
|---|---|
| História | US28 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela; um segundo usuário ativo, para sair e entrar com outro login. |
| Entradas e passos | Com grave sem reconhecimento, recarregar; sair; entrar com outro usuário. |
| Resultado esperado | A faixa continua, porque o estado está no servidor. |
| Teste automatizado | `us28.e2e-spec.ts` › US28-3 a faixa vem do servidor: outro usuário, com outro login, vê o mesmo alerta grave |
| Execução | automatizado e manual; manual: Persistência da faixa na tela. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-051 — Manter o grave sem reconhecimento no topo da lista

| Campo | Valor |
|---|---|
| História | US28 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Ter um grave sem reconhecimento e um grave mais recente em atendimento; abrir Alertas. |
| Resultado esperado | O grave sem reconhecimento fica acima de tudo. |
| Teste automatizado | `us28.e2e-spec.ts` › US28-4 o grave sem reconhecimento fica no topo, acima até de um grave mais recente já em atendimento |
| Execução | automatizado e manual; manual: Ordem na tela. Tela: Alertas e faixa grave, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-052 — Exigir a providência no reconhecimento

| Campo | Valor |
|---|---|
| História | US04 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe inválida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir um alerta aberto › Reconhecer; tentar confirmar sem texto e só com espaços. |
| Resultado esperado | Reconhecimento recusado com a mensagem pedindo a providência. |
| Teste automatizado | `us04.e2e-spec.ts` › US04-1 o reconhecimento exige a providência adotada |
| Execução | automatizado e manual; manual: Painel de reconhecimento na tela. Tela: Alertas e faixa grave, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-053 — Gravar usuário, data, hora e providência, e passar a em atendimento

| Campo | Valor |
|---|---|
| História | US04 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Reconhecer um alerta aberto com providência. |
| Resultado esperado | Alerta em atendimento com o usuário, a data e a hora e a providência. |
| Teste automatizado | `us04.e2e-spec.ts` › US04-2 grava o usuário, a data e a hora e a providência, e o alerta passa a em atendimento |
| Execução | automatizado e manual; manual: Estado de sucesso do painel. Tela: Alertas e faixa grave, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-054 — Recusar o segundo reconhecimento, mesmo simultâneo

| Campo | Valor |
|---|---|
| História | US04 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Reconhecer o mesmo alerta em duas sessões quase ao mesmo tempo; tentar reconhecer alerta encerrado e inexistente. |
| Resultado esperado | Só um aceito; o outro recebe a mensagem com quem reconheceu e quando; encerrado e inexistente recusados. |
| Teste automatizado | `us04.e2e-spec.ts` › US04-3 a segunda tentativa é recusada com a mensagem de quem reconheceu e quando<br>`us04.e2e-spec.ts` › US04-3 duas tentativas simultâneas: só uma é aceita<br>`us04.e2e-spec.ts` › US04-3 alerta encerrado ou inexistente não é reconhecido |
| Execução | automatizado e manual; manual: Estado de recusa do painel. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-055 — Registrar o reconhecimento no log de atividades

| Campo | Valor |
|---|---|
| História | US04 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Reconhecer um alerta; consultar `log_atividade`. |
| Resultado esperado | Registro com o autor, o alerta e a providência. |
| Teste automatizado | `us04.e2e-spec.ts` › US04-4 o reconhecimento gera registro no log de atividades |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-056 — Registrar ocorrência com categoria, descrição, localização, gravidade e órgão

| Campo | Valor |
|---|---|
| História | US05 · núcleo |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Registrar ocorrência › preencher os campos, marcar o ponto no mapa e informar o endereço; salvar. Repetir com ponto na zona rural. |
| Resultado esperado | Ocorrência gravada com o bairro calculado; zona rural sem bairro; listas de categoria e órgão vêm da API. |
| Teste automatizado | `us05.e2e-spec.ts` › US05-1 grava os campos e calcula o bairro pela localização<br>`us05.e2e-spec.ts` › US05-1 as listas de categorias e de órgãos vêm da interface de programação<br>`us05.e2e-spec.ts` › US05-1 ponto na zona rural fica sem bairro |
| Execução | automatizado e manual; manual: Formulário de ocorrência na tela. Tela: Ocorrências, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-057 — Gerar protocolo único no formato do protótipo

| Campo | Valor |
|---|---|
| História | US05 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Registrar várias ocorrências, inclusive simultâneas. |
| Resultado esperado | Protocolo no formato `AAAA-MM-sequência`, sem repetição. |
| Teste automatizado | `us05.e2e-spec.ts` › US05-2 o protocolo segue o formato do protótipo e é único, mesmo com registros simultâneos |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-058 — Gravar quem registrou, a origem telefone, a situação aberta e o primeiro histórico

| Campo | Valor |
|---|---|
| História | US05 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Registrar uma ocorrência; consultar o detalhe. |
| Resultado esperado | Usuário que registrou, origem "telefone", situação "aberta" e o primeiro registro do histórico. |
| Teste automatizado | `us05.e2e-spec.ts` › US05-3 grava quem registrou, a origem telefone, a situação aberta e o primeiro registro do histórico |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-059 — Recusar o cadastro sem categoria, gravidade ou localização, ou fora do município

| Campo | Valor |
|---|---|
| História | US05 · núcleo |
| Prioridade · técnica | alta · Particionamento (classe inválida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Tentar salvar sem categoria, sem gravidade, sem ponto e com ponto fora do município; salvar sem órgão e sem descrição. |
| Resultado esperado | Recusado com mensagem nos quatro primeiros; órgão e descrição são opcionais. |
| Teste automatizado | `us05.e2e-spec.ts` › US05-4 sem categoria, sem gravidade ou sem localização é recusado com mensagem<br>`us05.e2e-spec.ts` › US05-4 ponto fora do município é recusado<br>`us05.e2e-spec.ts` › US05-4 órgão e descrição são opcionais |
| Execução | automatizado e manual; manual: Mensagens do formulário. Tela: Ocorrências, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-060 — Abrir ocorrência a partir de um alerta, que fica vinculado

| Campo | Valor |
|---|---|
| História | US05 · núcleo |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Em Alertas, "Abrir" num alerta sem ocorrência; salvar; tentar de novo no mesmo alerta e num inexistente. |
| Resultado esperado | Alerta vinculado e origem "alerta"; alerta já vinculado ou inexistente não abre outra. |
| Teste automatizado | `us05.e2e-spec.ts` › US05-5 o alerta fica vinculado e a origem é alerta<br>`us05.e2e-spec.ts` › US05-5 alerta já vinculado ou inexistente não abre outra ocorrência |
| Execução | automatizado e manual; manual: Registro a partir do alerta na tela. Tela: Ocorrências, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-061 — Registrar no log e mostrar a ocorrência no mapa em tempo real

| Campo | Valor |
|---|---|
| História | US05 · núcleo |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Com o mapa aberto em outra aba, registrar uma ocorrência; consultar `log_atividade`. |
| Resultado esperado | Entrada no log; a ocorrência aparece no mapa sem recarregar. |
| Teste automatizado | `us05.e2e-spec.ts` › US05-6 o registro gera entrada no log de atividades<br>`us05.e2e-spec.ts` › US05-6 a ocorrência nova chega às telas e aparece na lista do mapa |
| Execução | automatizado e manual; manual: Marcador novo no mapa. Tela: Ocorrências, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-062 — Regra R1 do disparo: todas as condições verdadeiras abrem o alerta

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Regra ativa, mesma grandeza, leitura 600, duração zero, sensor ativo, sem alerta ativo. |
| Resultado esperado | Alerta aberto na primeira leitura. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 a condição precisa durar o tempo mínimo da regra, e a duração zero dispara na primeira leitura |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-063 — Regra R2 do disparo: regra desativada não dispara

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Igual a R1, com a regra desativada. |
| Resultado esperado | Nenhum alerta. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 regra desativada e regra de outra grandeza não disparam |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-064 — Regra R3 do disparo: regra de outra grandeza não dispara

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Igual a R1, com a regra sobre outra grandeza. |
| Resultado esperado | Nenhum alerta. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 regra desativada e regra de outra grandeza não disparam |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-065 — Regra R4 do disparo: leitura dentro do limite não dispara e reinicia a duração

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Regra de 10 min; leituras fora, dentro e fora do limite em sequência. |
| Resultado esperado | Nenhum alerta até a sequência fora do limite completar 10 min desde a leitura dentro. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 uma leitura dentro do limite reinicia a contagem da duração |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-066 — Regra R5 do disparo: duração mínima não cumprida não dispara

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Regra de 10 min; leituras fora do limite em t0 e t0 + 5 min. |
| Resultado esperado | Nenhum alerta em t0 + 5 min. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 a condição precisa durar o tempo mínimo da regra, e a duração zero dispara na primeira leitura |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-067 — Regra R6 do disparo: dispositivo em manutenção grava e não dispara

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Igual a R1, com o sensor em manutenção. |
| Resultado esperado | Leitura gravada, nenhum alerta. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 dispositivo em manutenção grava a leitura e não gera alerta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-068 — Regra R7 do disparo: alerta ativo da mesma regra e dispositivo impede outro

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Igual a R1, com um alerta já ativo. |
| Resultado esperado | Continua um único alerta. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-6 enquanto o alerta está ativo, novas leituras fora do limite não abrem outro |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-069 — Duração mínima: −1 é recusada e 0 é aceita

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | média · Valor limite |
| Pré-condições | Ambiente completo no ar; token do administrador obtido em `POST /api/auth/login`. |
| Entradas e passos | Cadastrar regra com duração −1; depois com 0; publicar uma leitura fora do limite. |
| Resultado esperado | −1 recusada com "A duração mínima não pode ser negativa."; 0 aceita e dispara na primeira leitura. |
| Teste automatizado | `us23.e2e-spec.ts` › US23-5 duração zero é aceita: dispara na primeira leitura |
| Execução | automatizado e manual; manual: Recusa de −1 (o teste automatizado usa −5, da mesma classe). Tela: Regras de alerta, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-070 — Duração mínima de 10 min: em t0 + 5 não dispara, em t0 + 10 dispara

| Campo | Valor |
|---|---|
| História | TT02 · núcleo |
| Prioridade · técnica | média · Valor limite |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Sensor ativo de nível; regra simples `>` 100 sobre a grandeza do sensor. |
| Entradas e passos | Regra de 10 min; leituras fora do limite em t0, t0 + 5 min e t0 + 10 min. |
| Resultado esperado | Alerta só na leitura de t0 + 10 min. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 a condição precisa durar o tempo mínimo da regra, e a duração zero dispara na primeira leitura |
| Execução | automatizado e manual; manual: Borda exata em t0 + 9 min 59 s, que o teste automatizado não cobre. Tela: Publicação MQTT nas fronteiras, cerca de 15 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-071 — Operador na fronteira: leitura igual ao limite

| Campo | Valor |
|---|---|
| História | US23 · núcleo |
| Prioridade · técnica | média · Valor limite |
| Pré-condições | Ambiente completo no ar; token do administrador obtido em `POST /api/auth/login`. Sensor de nível ativo de exemplo. |
| Entradas e passos | Regra `>` 3,5: publicar 3,5 e 3,51. Regra `>=` 3,5: publicar 3,49 e 3,5. Publicar pelo `mosquitto_pub` no tópico do sensor. |
| Resultado esperado | `>`: 3,5 não dispara, 3,51 dispara. `>=`: 3,49 não dispara, 3,5 dispara. |
| Teste automatizado | `unidade/regra.spec.ts` › US23-1 valor limite: leitura %s 3,5 com %d dá %s |
| Execução | automatizado e manual; manual: Publicação MQTT ponta a ponta, que inclui o encerramento por normalização, feito em SQL. Tela: Publicação MQTT nas fronteiras, cerca de 15 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-072 — Alerta T1: aberto, reconhecer com providência, em atendimento

| Campo | Valor |
|---|---|
| História | US04 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra simples ativa e sensor ativo. |
| Entradas e passos | Reconhecer um alerta aberto. |
| Resultado esperado | Situação em atendimento. |
| Teste automatizado | `us04.e2e-spec.ts` › US04-2 grava o usuário, a data e a hora e a providência, e o alerta passa a em atendimento |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-073 — Alerta T2: em atendimento, reconhecer de novo, recusado

| Campo | Valor |
|---|---|
| História | US04 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra simples ativa e sensor ativo. |
| Entradas e passos | Reconhecer um alerta já em atendimento. |
| Resultado esperado | 409 com quem reconheceu e quando; situação inalterada. |
| Teste automatizado | `us04.e2e-spec.ts` › US04-3 a segunda tentativa é recusada com a mensagem de quem reconheceu e quando |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-074 — Alerta T3: encerrado, reconhecer, recusado

| Campo | Valor |
|---|---|
| História | US04 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra simples ativa e sensor ativo. |
| Entradas e passos | Reconhecer um alerta encerrado. |
| Resultado esperado | Recusado; situação inalterada. |
| Teste automatizado | `us04.e2e-spec.ts` › US04-3 alerta encerrado ou inexistente não é reconhecido |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-075 — Alerta T4: aberto não grave, leitura normal, encerrado

| Campo | Valor |
|---|---|
| História | US28 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra simples ativa e sensor ativo. |
| Entradas e passos | Alerta de atenção aberto; publicar leitura dentro do limite. |
| Resultado esperado | Situação encerrado, com data de encerramento. |
| Teste automatizado | `us28.e2e-spec.ts` › US28-1 atenção e informativo sem reconhecimento são encerrados quando a leitura volta ao normal |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-076 — Alerta T5: aberto grave, leitura normal, continua aberto

| Campo | Valor |
|---|---|
| História | US28 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra simples ativa e sensor ativo. |
| Entradas e passos | Alerta grave aberto; publicar leitura dentro do limite. |
| Resultado esperado | Situação aberto. |
| Teste automatizado | `us28.e2e-spec.ts` › US28-1 o alerta grave sem reconhecimento nunca é encerrado automaticamente |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-077 — Alerta T6: em atendimento, leitura normal, continua em atendimento

| Campo | Valor |
|---|---|
| História | US28 · núcleo |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra simples ativa e sensor ativo. |
| Entradas e passos | Alerta reconhecido; publicar leitura dentro do limite. |
| Resultado esperado | Situação em atendimento. |
| Teste automatizado | `us28.e2e-spec.ts` › US28-1 o alerta já reconhecido não é encerrado pela normalização |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-078 — Situação operando: comunicação dentro de duas vezes o intervalo

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | média · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Publicar uma leitura de um dispositivo com intervalo de 30 s; listar. |
| Resultado esperado | Situação operando. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-2 o dispositivo passa de sem comunicação a operando<br>`unidade/comunicacao.spec.ts` › US22-6 o limite é duas vezes o intervalo do dispositivo, senão o do tipo, senão 30 minutos<br>`unidade/comunicacao.spec.ts` › US22-6 valor limite: no limite exato continua operando, um segundo depois fica sem comunicação<br>`unidade/comunicacao.spec.ts` › US22-6 partições: nunca comunicou, manutenção e inativo<br>`us22.e2e-spec.ts` › US22-6 a situação e o limite calculados no banco batem com a regra de referência da suíte de unidade |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-079 — Situação sem comunicação: além de duas vezes o intervalo, ou nunca comunicou

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | média · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Dispositivo com intervalo próprio, só com o do tipo e sem nenhum; deixar passar o limite; dispositivo novo sem leitura. |
| Resultado esperado | Sem comunicação depois de 2 × intervalo do dispositivo, do tipo ou, sem nenhum, de 30 min; o que nunca comunicou também. |
| Teste automatizado | `us22.e2e-spec.ts` › US22-6 sem comunicação passa de duas vezes o intervalo do dispositivo, do tipo ou, sem nenhum, de 30 minutos<br>`unidade/comunicacao.spec.ts` › US22-6 o limite é duas vezes o intervalo do dispositivo, senão o do tipo, senão 30 minutos<br>`unidade/comunicacao.spec.ts` › US22-6 valor limite: no limite exato continua operando, um segundo depois fica sem comunicação<br>`unidade/comunicacao.spec.ts` › US22-6 partições: nunca comunicou, manutenção e inativo<br>`us22.e2e-spec.ts` › US22-6 a situação e o limite calculados no banco batem com a regra de referência da suíte de unidade |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-080 — Situação manutenção: grava a leitura e não dispara alerta

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | média · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Dispositivo em manutenção recebe leitura fora do limite. |
| Resultado esperado | Leitura gravada, nenhum alerta, situação manutenção. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-4 dispositivo em manutenção grava a leitura e não gera alerta<br>`unidade/comunicacao.spec.ts` › US22-6 partições: nunca comunicou, manutenção e inativo<br>`us22.e2e-spec.ts` › US22-6 a situação e o limite calculados no banco batem com a regra de referência da suíte de unidade |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-081 — Situação inativo: mensagem descartada e dispositivo fora do mapa

| Campo | Valor |
|---|---|
| História | US22 · núcleo |
| Prioridade · técnica | média · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Publicar para dispositivo inativo; consultar a lista do mapa. |
| Resultado esperado | Mensagem descartada e registrada no log; dispositivo marcado como inativo para o mapa deixar de fora. |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-3 mensagem inválida é descartada sem derrubar o assinante e fica registrada no log<br>`us01.e2e-spec.ts` › US01-1 a listagem informa o estado, para o mapa deixar de fora os inativos<br>`unidade/comunicacao.spec.ts` › US22-6 partições: nunca comunicou, manutenção e inativo<br>`us22.e2e-spec.ts` › US22-6 a situação e o limite calculados no banco batem com a regra de referência da suíte de unidade |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-082 — Manter desabilitados, com a marca "backlog", os elementos das histórias de prioridade baixa

| Campo | Valor |
|---|---|
| História | US08, US16, US25 · núcleo |
| Prioridade · técnica | baixa · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Conferir Relatórios (US16), filtros (US08), exportar (US25) e as caixas de busca das listas (US08) em todas as telas. |
| Resultado esperado | Visíveis, desabilitados e com a marca "backlog" no título. |
| Teste automatizado | não há |
| Execução | manual; manual: Inspeção das telas. Tela: Elementos do backlog, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

## Casos do escopo estendido

### CT-083 — Identificar na tela os dados do simulador

| Campo | Valor |
|---|---|
| História | TT02-9 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Dispositivos, o mapa e Alertas com o simulador ligado. |
| Resultado esperado | Leituras gravadas com origem `simulador`; dispositivos e alertas que vêm dele com a marca "simulado". |
| Teste automatizado | `tt02.e2e-spec.ts` › TT02-9 a leitura do simulador é gravada com origem simulador e o dispositivo e o alerta aparecem como simulados |
| Execução | automatizado e manual; manual: Marca "simulado" nas três telas. Tela: Dispositivos e histórico, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-084 — Listar as ocorrências com as colunas e as visões do protótipo

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Ocorrências; alternar entre Em andamento e Encerradas; pedir visão inválida pela API. |
| Resultado esperado | Protocolo, gravidade, categoria, bairro, órgão, situação e abertura; abertas antes das em atendimento, depois a mais grave e a mais antiga; visão inválida, 400. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-1 cada ocorrência tem protocolo, gravidade, categoria, bairro, órgão, situação e abertura<br>`us06.e2e-spec.ts` › US06-1 em andamento, abertas vêm antes das em atendimento; depois a mais grave e a mais antiga<br>`us06.e2e-spec.ts` › US06-1 visão inválida é recusada |
| Execução | automatizado e manual; manual: Lista e visões na tela. Tela: Ocorrências, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-085 — Mostrar no detalhe o histórico do atendimento com os alertas

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir uma ocorrência vinda de alerta, com providências. |
| Resultado esperado | Histórico com a geração e o reconhecimento do alerta e os registros do atendimento, em ordem; inexistente, 404. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-2 o histórico junta a geração e o reconhecimento do alerta com os registros do atendimento<br>`us06.e2e-spec.ts` › US06-2 ocorrência inexistente responde 404 |
| Execução | automatizado e manual; manual: Detalhe na tela. Tela: Ocorrências, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-086 — Registrar providência e mudar a situação

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Executar as transições O1 a O3 da ocorrência (seção "Modelos das técnicas"); registrar providência pela tela. |
| Resultado esperado | Primeira providência passa a em atendimento; as seguintes mantêm; vazia ou situação inválida recusada. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-3 a primeira providência de uma ocorrência aberta passa para em atendimento<br>`us06.e2e-spec.ts` › US06-3 providência em atendimento mantém a situação e também entra no histórico<br>`us06.e2e-spec.ts` › US06-3 providência vazia ou situação inválida é recusada |
| Execução | automatizado e manual; manual: Caixa de providência na tela. Tela: Ocorrências, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-087 — Encerrar com observação obrigatória

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Executar as transições O4 a O6 (seção "Modelos das técnicas"); encerrar pela tela. |
| Resultado esperado | Sem observação, recusado; encerrar grava a data e encerra só os alertas em atendimento; encerrada não aceita atualização. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-4 sem observação o encerramento é recusado<br>`us06.e2e-spec.ts` › US06-4 encerrar grava a data e encerra só os alertas vinculados em atendimento<br>`us06.e2e-spec.ts` › US06-4 ocorrência encerrada não aceita outra atualização |
| Execução | automatizado e manual; manual: Encerramento na tela. Tela: Ocorrências, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-088 — Tirar a encerrada da lista em andamento e do mapa, mantendo a consulta

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Encerrar uma ocorrência; ver a lista, o mapa e a visão Encerradas. |
| Resultado esperado | Sai de Em andamento e do mapa; aparece em Encerradas e abre o detalhe. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-5 a encerrada sai da lista em andamento e do mapa, e continua consultável |
| Execução | automatizado e manual; manual: Lista e mapa na tela. Tela: Ocorrências, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-089 — Registrar providência e encerramento no log e em tempo real

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Duas sessões; registrar providência e encerrar na primeira; consultar `log_atividade`. |
| Resultado esperado | Registros no log; a segunda sessão recebe as mudanças sem recarregar. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-6 providência e encerramento geram registros no log de atividades<br>`us06.e2e-spec.ts` › US06-6 a atualização e o alerta encerrado chegam às outras telas |
| Execução | automatizado e manual; manual: Atualização da segunda sessão. Tela: Ocorrências, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-090 — Avisar quando um dispositivo ativo parar de enviar dados

| Campo | Valor |
|---|---|
| História | US07 · estendido |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Rotina de 60 s; dispositivo além do limite; dispositivo que nunca comunicou; dispositivo dentro do limite. |
| Resultado esperado | Alerta com o tempo e o limite em minutos; sem valor para quem nunca comunicou; nenhum para quem está no limite; regra de sistema visível e não editável. |
| Teste automatizado | `us07.e2e-spec.ts` › US07-1 a rotina é agendada a cada 60 s quando nada é configurado<br>`us07.e2e-spec.ts` › US07-1 dispositivo ativo além do limite da US22 recebe o alerta, com o tempo e o limite em minutos<br>`us07.e2e-spec.ts` › US07-1 dispositivo que nunca se comunicou recebe o alerta sem valor, e não uma contagem desde a instalação<br>`us07.e2e-spec.ts` › US07-1 dispositivo dentro do limite não recebe alerta<br>`us07.e2e-spec.ts` › US07-1 a regra de sistema aparece na tela de regras, marcada, e não pode ser editada nem desativada<br>`us07.e2e-spec.ts` › US07-1 o alerta não muda a cor do dispositivo, que continua sem comunicação |
| Execução | automatizado e manual; manual: Regra de sistema marcada na tela de regras. Tela: Regras de alerta, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-091 — Manter no máximo um alerta de sem comunicação por dispositivo

| Campo | Valor |
|---|---|
| História | US07 · estendido |
| Prioridade · técnica | média · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Rodar a rotina várias vezes com o dispositivo parado. |
| Resultado esperado | Um único alerta ativo. |
| Teste automatizado | `us07.e2e-spec.ts` › US07-2 há no máximo um alerta de sem comunicação ativo por dispositivo |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-092 — Encerrar o aviso quando o dispositivo voltar

| Campo | Valor |
|---|---|
| História | US07 · estendido |
| Prioridade · técnica | média · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Com alerta aberto, publicar sinal de vida; repetir com alerta reconhecido. |
| Resultado esperado | O aberto encerra; o reconhecido continua em atendimento. |
| Teste automatizado | `us07.e2e-spec.ts` › US07-3 o sinal de vida encerra o alerta aberto<br>`us07.e2e-spec.ts` › US07-3 alerta já reconhecido continua em atendimento |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-093 — Não avisar dispositivo em manutenção ou inativo

| Campo | Valor |
|---|---|
| História | US07 · estendido |
| Prioridade · técnica | média · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Deixar parados um dispositivo em manutenção e um inativo; rodar a rotina. |
| Resultado esperado | Nenhum alerta. |
| Teste automatizado | `us07.e2e-spec.ts` › US07-4 dispositivo em manutenção ou inativo não gera o alerta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-094 — Coletar a vazão do Open-Meteo Flood API

| Campo | Valor |
|---|---|
| História | US09 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Rotina de 60 min; resposta simulada com 7 dias passados, hoje e 3 de previsão; coletar duas vezes. |
| Resultado esperado | Vazão até hoje como leitura de origem `open-meteo` e os dias seguintes como previsão, sem duplicar; não muda a comunicação do sensor. |
| Teste automatizado | `us09.e2e-spec.ts` › US09-1 a rotina é agendada a cada 60 min quando nada é configurado<br>`us09.e2e-spec.ts` › US09-1 grava a vazão diária até hoje como leitura e os dias seguintes como previsão, sem duplicar<br>`us09.e2e-spec.ts` › US09-1 a vazão externa não muda a última comunicação nem a última leitura do sensor |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-095 — Mostrar cada ponto do rio com nível, tendência, série e vazão

| Campo | Valor |
|---|---|
| História | US09 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir /rios pelo indicador "Nível dos rios" do painel. |
| Resultado esperado | Por arroio: nível atual, tendência da última hora, série de 6 h, vazão de hoje e a cota da menor regra ativa de nível; sensor inativo sem nível e com vazão. |
| Teste automatizado | `us09.e2e-spec.ts` › US09-2 cada ponto traz o nível atual, a tendência da última hora, a série de 6 h e a vazão de hoje<br>`us09.e2e-spec.ts` › US09-2 a cota vem da menor regra ativa de nível acima de um limite<br>`us09.e2e-spec.ts` › US09-2 sensor inativo continua como ponto, sem nível, e com a vazão do Open-Meteo |
| Execução | automatizado e manual; manual: Cartões dos rios na tela. Tela: Rios, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-096 — Atualizar a tela dos rios em tempo real

| Campo | Valor |
|---|---|
| História | US09 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Com /rios aberta, publicar leitura de nível. |
| Resultado esperado | O cartão muda sem recarregar. |
| Teste automatizado | `us09.e2e-spec.ts` › US09-3 leitura de nível nova e coleta concluída chegam às telas em tempo real |
| Execução | automatizado e manual; manual: Atualização da tela. Tela: Rios, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-097 — Registrar a falha da fonte sem derrubar a rotina

| Campo | Valor |
|---|---|
| História | US09 · estendido |
| Prioridade · técnica | média · Particionamento (classe inválida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Resposta simulada com erro de rede e com HTTP 500. |
| Resultado esperado | Erro registrado na fonte; a rotina não lança; a última coleta boa continua valendo. |
| Teste automatizado | `us09.e2e-spec.ts` › US09-4 erro de rede ou HTTP é registrado, a rotina não lança e a última coleta boa continua |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-098 — Disparar o risco de enchente pela combinação de nível e chuva ou vazão

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Executar as regras E1 a E6 da tabela de decisão da enchente (seção "Modelos das técnicas"). |
| Resultado esperado | O alerta só abre com nível acima da cota e chuva ou vazão prevista acima do limite, no mesmo bairro e na janela. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-1 a regra de risco de enchente vem na carga inicial: cota 3,5 m, chuva 50 mm, vazão prevista 15 m³/s, janela de 24 h |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-099 — Informar no alerta as duas leituras que o compõem

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Disparar o risco de enchente; abrir o alerta. |
| Resultado esperado | Leitura de nível e de chuva (ou vazão prevista), com valores, limites e dispositivos. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-2 o alerta informa a leitura de nível e a de chuva que o compõem |
| Execução | automatizado e manual; manual: Composição no painel do alerta. Tela: Alertas e faixa grave, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-100 — Ajustar os limites da regra de enchente pela tela

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Editar o limite de chuva; tentar limites inválidos, troca de grandeza e campos de enchente numa regra simples. |
| Resultado esperado | O novo limite muda o disparo e entra no histórico; os inválidos são recusados. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-3 mudar o limite de chuva muda o disparo e fica no histórico da regra<br>`us10.e2e-spec.ts` › US10-3 limites inválidos, troca de grandeza e campos de enchente numa regra simples são recusados |
| Execução | automatizado e manual; manual: Bloco de três campos no formulário. Tela: Regras de alerta, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-101 — Regra E1 da enchente: nível acima da cota e chuva forte no bairro, na janela, abre

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra de risco de enchente da carga inicial; sensor de nível e estação de chuva no mesmo bairro. |
| Entradas e passos | Chuva de 60 mm há 2 h no bairro; nível de 3,8 m. |
| Resultado esperado | Alerta aberto. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-1 nível acima da cota com chuva forte no mesmo bairro dentro da janela abre o alerta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-102 — Regra E2 da enchente: nível acima da cota e vazão prevista acima do limite, sem chuva, abre

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra de risco de enchente da carga inicial; sensor de nível e estação de chuva no mesmo bairro. |
| Entradas e passos | Sem chuva; previsão de vazão de 20 m³/s dentro da janela; nível de 3,8 m. |
| Resultado esperado | Alerta aberto. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-1 a vazão prevista do Open-Meteo acima do limite também compõe o alerta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-103 — Regra E3 da enchente: só o nível acima da cota não abre

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra de risco de enchente da carga inicial; sensor de nível e estação de chuva no mesmo bairro. |
| Entradas e passos | Sem chuva nem vazão prevista acima do limite; nível de 3,8 m. |
| Resultado esperado | Nenhum alerta. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-1 só o nível acima da cota não basta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-104 — Regra E4 da enchente: nível abaixo da cota não abre, mesmo com chuva

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra de risco de enchente da carga inicial; sensor de nível e estação de chuva no mesmo bairro. |
| Entradas e passos | Chuva de 60 mm; nível de 3,0 m. |
| Resultado esperado | Nenhum alerta. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-1 nível abaixo da cota não dispara, mesmo com chuva |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-105 — Regra E5 da enchente: chuva em outro bairro ou fora da janela não conta

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra de risco de enchente da carga inicial; sensor de nível e estação de chuva no mesmo bairro. |
| Entradas e passos | Chuva de 60 mm em outro bairro; depois chuva no bairro há 30 h; nível de 3,8 m. |
| Resultado esperado | Nenhum alerta. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-1 chuva em outro bairro ou fora da janela não conta |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-106 — Regra E6 da enchente: com alerta ativo, novas leituras não abrem outro

| Campo | Valor |
|---|---|
| História | US10 · estendido |
| Prioridade · técnica | alta · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Regra de risco de enchente da carga inicial; sensor de nível e estação de chuva no mesmo bairro. |
| Entradas e passos | Com o alerta de E1 ativo, novo nível de 3,9 m. |
| Resultado esperado | Continua um único alerta. |
| Teste automatizado | `us10.e2e-spec.ts` › US10-1 enquanto o alerta está ativo, novas leituras não abrem outro |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-107 — Cota do rio na fronteira: nível igual à cota

| Campo | Valor |
|---|---|
| História | US09 · estendido |
| Prioridade · técnica | média · Valor limite |
| Pré-condições | Ambiente completo no ar; token do administrador obtido em `POST /api/auth/login`. Regra de risco de enchente com cota 3,5 m e chuva forte registrada no bairro. |
| Entradas e passos | Publicar nível 3,5 e depois 3,51 pelo `mosquitto_pub`; abrir /rios. |
| Resultado esperado | 3,5 não abre o alerta nem marca "acima da cota"; 3,51 abre e marca. |
| Teste automatizado | não há |
| Execução | manual; manual: Publicação MQTT e conferência na tela dos rios. Tela: Publicação MQTT nas fronteiras, cerca de 15 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-108 — Calcular os seis indicadores a partir das leituras

| Campo | Valor |
|---|---|
| História | US12 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir o painel com o simulador ligado. |
| Resultado esperado | Nível dos rios, fluxo, qualidade do ar (IQAr), iluminação, ruído e vagas, na ordem do protótipo, calculados das leituras da última hora. |
| Teste automatizado | `us12.e2e-spec.ts` › US12-1 a faixa traz os seis indicadores do protótipo, na ordem<br>`us12.e2e-spec.ts` › US12-1 nível dos rios é o maior nível medido na última hora<br>`us12.e2e-spec.ts` › US12-1 qualidade do ar é o pior IQAr (CONAMA 506/2024) da média de 24 h do PM2.5 das estações<br>`us12.e2e-spec.ts` › US12-1 iluminação pública é a parcela de pontos de luz respondendo<br>`us12.e2e-spec.ts` › US12-1 fluxo de veículos é a velocidade média dos sensores de tráfego e ruído é o maior nível sonoro<br>`unidade/indicadores.spec.ts` › US12-1 os seis indicadores vêm na ordem do protótipo<br>`unidade/indicadores.spec.ts` › US12-1 nível dos rios: o maior nível, a variação por hora e o ponto acima da cota<br>`unidade/indicadores.spec.ts` › US12-1 nível dos rios: abaixo da cota conta os pontos e sem cota não tem barra<br>`unidade/indicadores.spec.ts` › US12-1 fluxo: média das velocidades e variação contra a média de uma hora antes<br>`unidade/indicadores.spec.ts` › US12-1 qualidade do ar: pior IQAr pela média de 24 h, com a qualidade e os bairros<br>`unidade/indicadores.spec.ts` › US12-1 qualidade do ar: sem média usa a última leitura, e a variação acima de 5 pontos aparece com sinal<br>`unidade/indicadores.spec.ts` › US12-1 iluminação: parcela de pontos respondendo pelo total dos controladores<br>`unidade/indicadores.spec.ts` › US12-1 ruído: o maior nível, dentro ou acima do limite da regra<br>`unidade/indicadores.spec.ts` › US12-1 vagas: soma das vagas livres e variação |
| Execução | automatizado e manual; manual: Faixa de indicadores na tela. Tela: Mapa e painel, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-109 — Mostrar valor, unidade, variação e nota, em vermelho com alerta ativo

| Campo | Valor |
|---|---|
| História | US12 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Disparar alerta grave de uma grandeza do painel. |
| Resultado esperado | Valor, unidade, variação e nota em cada indicador; com alerta grave, o indicador fica vermelho; com atenção, só a barra fica âmbar. |
| Teste automatizado | `us12.e2e-spec.ts` › US12-2 cada indicador traz valor, unidade, variação e nota, e fica grave com alerta grave ativo da grandeza<br>`unidade/indicadores.spec.ts` › US12-2 tabela de decisão do estado: grave vence atenção, atenção vence estável, só da mesma grandeza |
| Execução | automatizado e manual; manual: Cores do indicador na tela. Tela: Mapa e painel, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-110 — Mostrar "sem dados" sem leitura na última hora

| Campo | Valor |
|---|---|
| História | US12 · estendido |
| Prioridade · técnica | média · Particionamento (classe inválida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Sem leitura de uma grandeza na última hora. |
| Resultado esperado | Indicador "sem dados", sem valor. |
| Teste automatizado | `us12.e2e-spec.ts` › US12-3 indicador sem leitura na última hora aparece sem dados, sem valor inventado<br>`unidade/indicadores.spec.ts` › US12-3 sem leitura, todos ficam sem dados e sem valor |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-111 — Montar os gráficos de ocorrências a partir das ocorrências registradas

| Campo | Valor |
|---|---|
| História | US12 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Registrar ocorrências hoje em bairros diferentes; abrir o painel. |
| Resultado esperado | "Ocorrências abertas hoje" com o acumulado por hora e a média das quatro semanas; "por bairro" com os cinco maiores das 24 h. |
| Teste automatizado | `us12.e2e-spec.ts` › US12-4 "abertas hoje" acumula as de hoje por hora contra a média das quatro semanas anteriores<br>`us12.e2e-spec.ts` › US12-4 "por bairro" conta as ocorrências das últimas 24 horas |
| Execução | automatizado e manual; manual: Gráficos na tela. Tela: Mapa e painel, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-112 — Atualizar o painel em tempo real

| Campo | Valor |
|---|---|
| História | US12 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Com o painel aberto, publicar leitura e disparar alerta. |
| Resultado esperado | Os indicadores mudam sem recarregar. |
| Teste automatizado | `us12.e2e-spec.ts` › US12-5 a leitura nova avisa as telas e muda o indicador na consulta seguinte |
| Execução | automatizado e manual; manual: Atualização da tela. Tela: Mapa e painel, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-113 — Faixas do IQAr do PM2.5 nas bordas e no arredondamento

| Campo | Valor |
|---|---|
| História | US12 · estendido |
| Prioridade · técnica | média · Valor limite |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Calcular o IQAr de 0, 15, 16, 50, 51, 75, 76, 125, 126, 300 e 500 µg/m³; de 15,4, 15,5 e 16,5; classificar 40, 41, 80, 81, 120, 121, 200, 201 e 400. |
| Resultado esperado | Índices 0, 40, 41, 80, 81, 120, 121, 200, 201, 400 e 400; 40, 41 e 41 (x,5 vai para o par); boa, moderada, moderada, ruim, ruim, muito ruim, muito ruim, péssima e péssima. |
| Teste automatizado | `us12.e2e-spec.ts` › US12-1 qualidade do ar é o pior IQAr (CONAMA 506/2024) da média de 24 h do PM2.5 das estações<br>`unidade/iqar.spec.ts` › US12-1 valor limite: %d µg/m³ dá índice %d<br>`unidade/iqar.spec.ts` › US12-1 a concentração é arredondada antes, e x,5 vai para o par<br>`unidade/iqar.spec.ts` › US12-1 partições inválidas: negativa vale zero e acima de 300 fica no teto de 400<br>`unidade/iqar.spec.ts` › US12-1 valor limite: índice %d é %s, %s |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-114 — Buscar por protocolo, endereço, bairro e código de dispositivo

| Campo | Valor |
|---|---|
| História | US26 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Digitar na caixa do cabeçalho um protocolo, parte de um endereço, um bairro e um código; pela API, `%%%` e sem token. |
| Resultado esperado | Resultados correspondentes; `%` e `_` tratados como texto; sem token, 401. |
| Teste automatizado | `us26.e2e-spec.ts` › US26-1 encontra a ocorrência pelo protocolo<br>`us26.e2e-spec.ts` › US26-1 encontra a ocorrência e o dispositivo pelo endereço<br>`us26.e2e-spec.ts` › US26-1 encontra pelo bairro<br>`us26.e2e-spec.ts` › US26-1 encontra o dispositivo pelo código<br>`us26.e2e-spec.ts` › US26-1 trata % e _ como texto, não como curinga<br>`us26.e2e-spec.ts` › US26-1 exige autenticação |
| Execução | automatizado e manual; manual: Lista sob a caixa na tela. Tela: Busca do cabeçalho, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-115 — Agrupar os resultados e abrir o detalhe

| Campo | Valor |
|---|---|
| História | US26 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Buscar um termo que traga os dois grupos; navegar com as setas e Enter; clicar num dispositivo. |
| Resultado esperado | Grupos Ocorrências e Dispositivos; Enter abre a ocorrência; o dispositivo abre no painel de edição; Esc fecha. |
| Teste automatizado | `us26.e2e-spec.ts` › US26-2 separa ocorrências e dispositivos, e cada resultado abre o seu detalhe |
| Execução | automatizado e manual; manual: Navegação pelo teclado e abertura do detalhe. Tela: Busca do cabeçalho, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-116 — Ignorar maiúsculas e acentos

| Campo | Valor |
|---|---|
| História | US26 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Buscar "Cará-Cará", "cara-cara" e "CARÁ-CARÁ"; buscar um endereço com acento escrito sem acento. |
| Resultado esperado | Mesmos resultados. |
| Teste automatizado | `us26.e2e-spec.ts` › US26-3 sem acento e em maiúsculas encontra o mesmo que o texto original |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-117 — Mínimo de três caracteres na busca

| Campo | Valor |
|---|---|
| História | US26 · estendido |
| Prioridade · técnica | média · Valor limite |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Digitar "ab"; "  ab  "; "abc". Pela API, `q=ab`, `q=  ab  `, sem `q` e `q=%%%`. |
| Resultado esperado | Com 2 caracteres, a tela pede pelo menos 3 e a API responde 400, sem contar os espaços; com 3, busca. |
| Teste automatizado | `us26.e2e-spec.ts` › US26-1 recusa menos de três caracteres, sem contar os espaços<br>`us26.e2e-spec.ts` › US26-1 trata % e _ como texto, não como curinga |
| Execução | automatizado e manual; manual: Aviso de mínimo na tela. Tela: Busca do cabeçalho, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-118 — Cadastrar, editar e inativar usuários, sem excluir

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Usuários › Cadastrar; entrar com a senha provisória; editar órgão e perfil; inativar; gerar nova senha; tentar e-mail de outro domínio e repetido. |
| Resultado esperado | Senha provisória mostrada uma vez e válida; inativo não entra e a sessão aberta cai; continua na lista; nova senha invalida a anterior; recusas com mensagem; o administrador não inativa nem rebaixa a si mesmo. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-1 cadastra com nome, e-mail funcional, órgão e perfil, e a senha provisória entra<br>`us21.e2e-spec.ts` › US21-1 recusa e-mail fora do domínio funcional, e-mail repetido, órgão ou perfil inexistente e campo vazio<br>`us21.e2e-spec.ts` › US21-1 edita nome, órgão e perfil<br>`us21.e2e-spec.ts` › US21-1 inativa sem excluir: o usuário deixa de entrar, a sessão aberta cai e ele continua na lista<br>`us21.e2e-spec.ts` › US21-1 o administrador não inativa nem muda o próprio perfil<br>`us21.e2e-spec.ts` › US21-1 nova senha provisória substitui a anterior |
| Execução | automatizado e manual; manual: Tela de usuários e senha provisória. Tela: Usuários e perfis, cerca de 15 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-119 — Recusar com 403 o que o perfil não permite

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | alta · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Executar os casos P1 a P4 dos perfis; entrar com cada perfil na tela. |
| Resultado esperado | Os quatro perfis acumulam consultar, operar, configurar e administrar; a recusa explica o motivo; na tela, botões não permitidos desabilitados e a aba Usuários apagada para quem não administra. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-2 os quatro perfis acumulam consultar, operar, configurar e administrar<br>`us21.e2e-spec.ts` › US21-2 o perfil de consulta não reconhece alerta nem registra providência, e a recusa explica o motivo |
| Execução | automatizado e manual; manual: Botões e aba por perfil. Tela: Usuários e perfis, cerca de 20 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-120 — Ver as ocorrências de todos e atualizar só as do próprio órgão

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | alta · Particionamento de equivalência |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela; os usuários de perfil criados no CT-118 e no CT-119, incluindo o de órgão diferente. |
| Entradas e passos | Operador da Defesa Civil abre uma ocorrência da Mobilidade e uma da Defesa Civil; registra providência nas duas. |
| Resultado esperado | Vê as duas; na da Mobilidade, 403 e a tela mostra quem pode atualizar; na da Defesa Civil, aceita. Sem órgão, qualquer operador atualiza; o administrador atualiza qualquer uma. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-3 operador da Defesa Civil vê a ocorrência da Mobilidade e não a atualiza; atualiza a da Defesa Civil<br>`us21.e2e-spec.ts` › US21-3 ocorrência sem órgão pode ser atualizada por qualquer operador, e o administrador atualiza a de qualquer órgão |
| Execução | automatizado e manual; manual: Detalhe da ocorrência de outro órgão. Tela: Ocorrências, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-121 — Registrar no log toda alteração de usuário ou perfil

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Cadastrar, mudar perfil e órgão, inativar, repetir a inativação e gerar nova senha; consultar `log_atividade`. |
| Resultado esperado | Cadastro, duas edições e nova senha, com o autor e antes e depois só dos campos alterados; a repetição sem mudança não gera registro; nenhuma senha no log. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-4 cadastro, edição de perfil e órgão, inativação e nova senha ficam no log com o autor |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-122 — Perfil P1, consulta: permissões nas rotas

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | alta · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Um usuário de cada perfil. |
| Entradas e passos | Com o perfil consulta: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. |
| Resultado esperado | Consulta 200; operar, configurar dispositivo, configurar regra e administrar 403. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-2 perfil consulta: consultar, operar, configurar dispositivo, configurar regra e administrar |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-123 — Perfil P2, operador: permissões nas rotas

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | alta · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Um usuário de cada perfil. |
| Entradas e passos | Com o perfil operador: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. |
| Resultado esperado | Consulta 200; operar passa da permissão (400 da validação); configurar e administrar 403. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-2 perfil operador: consultar, operar, configurar dispositivo, configurar regra e administrar |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-124 — Perfil P3, gestor: permissões nas rotas

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | alta · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Um usuário de cada perfil. |
| Entradas e passos | Com o perfil gestor: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. |
| Resultado esperado | Consulta 200; operar e configurar passam da permissão (400); administrar 403. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-2 perfil gestor: consultar, operar, configurar dispositivo, configurar regra e administrar |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-125 — Perfil P4, administrador: permissões nas rotas

| Campo | Valor |
|---|---|
| História | US21 · estendido |
| Prioridade · técnica | alta · Particionamento de equivalência |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Um usuário de cada perfil. |
| Entradas e passos | Com o perfil administrador: `GET /api/painel`, `POST /api/ocorrencias`, `POST /api/dispositivos` e `POST /api/regras-alerta` com corpo vazio, `GET /api/usuarios`. |
| Resultado esperado | Tudo passa da permissão: consulta e administrar 200, as escritas 400 da validação. |
| Teste automatizado | `us21.e2e-spec.ts` › US21-2 perfil administrador: consultar, operar, configurar dispositivo, configurar regra e administrar |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-126 — Aplicar as regras de PM2.5 e PM10 às leituras do Open-Meteo de cada bairro

| Campo | Valor |
|---|---|
| História | US18 · estendido |
| Prioridade · técnica | média · Tabela de decisão |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Resposta simulada da Air Quality API para os 16 bairros; regra PM2.5 `>` 6000; Centro com 5000 e 7000; depois 7000 e 5000; regra de 120 min com 3 h. |
| Resultado esperado | Uma requisição para todos os bairros, sem horas futuras e sem duplicar; alerta para o Centro e encerrado quando a leitura volta; a duração conta horas seguidas; falha da fonte registrada. |
| Teste automatizado | `us18.e2e-spec.ts` › US18-1 uma requisição traz PM2.5 e PM10 de todos os bairros, gravados por bairro sem duplicar e sem as horas futuras<br>`us18.e2e-spec.ts` › US18-1 a regra dispara para o bairro acima do limite e o alerta não grave se encerra quando a leitura volta<br>`us18.e2e-spec.ts` › US18-1 a duração mínima conta as horas seguidas acima do limite no bairro<br>`us18.e2e-spec.ts` › US18-1 falha do Open-Meteo fica registrada na fonte, sem derrubar a rotina |
| Execução | automatizado e manual; manual: Coleta real uma vez por rodada, contra a fonte. Tela: Publicação MQTT nas fronteiras, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-127 — Indicar o bairro e a fonte no alerta

| Campo | Valor |
|---|---|
| História | US18 · estendido |
| Prioridade · técnica | média · Particionamento (classe válida) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Disparar alerta de poluição de bairro; abrir em Alertas. |
| Resultado esperado | Sem dispositivo, com "Open-Meteo", o bairro e a fonte "Open-Meteo Air Quality API"; no mapa, dentro do bairro. |
| Teste automatizado | `us18.e2e-spec.ts` › US18-2 o alerta do bairro não tem dispositivo e traz o bairro, a fonte e a posição dentro do bairro |
| Execução | automatizado e manual; manual: Painel do alerta mostrando a fonte. Tela: Alertas e faixa grave, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-128 — Sugerir o Meio Ambiente ao abrir ocorrência do alerta de poluição

| Campo | Valor |
|---|---|
| História | US18 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | "Abrir" no alerta de poluição; depois num alerta de nível. |
| Resultado esperado | Poluição: órgão Meio Ambiente e categoria Qualidade do ar preenchidos, com a nota de sugestão; ocorrência vinculada. Nível: sem sugestão. |
| Teste automatizado | `us18.e2e-spec.ts` › US18-3 o alerta de poluição sugere o Meio Ambiente e a ocorrência aberta dele fica vinculada<br>`us18.e2e-spec.ts` › US18-3 alerta de outra grandeza não sugere órgão |
| Execução | automatizado e manual; manual: Formulário preenchido na tela. Tela: Ocorrências, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-129 — Abrir o gráfico histórico com período de 24 h, 7 dias ou 30 dias

| Campo | Valor |
|---|---|
| História | US19 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Dispositivos › um dispositivo › Ver histórico; alternar os períodos e a grandeza; pela API, período inválido e grandeza sem leitura. |
| Resultado esperado | 24 h em blocos de 5 min; 7 e 30 dias por hora com faixa mínimo–máximo; recusas com mensagem; dispositivo sem leitura, histórico vazio. |
| Teste automatizado | `us19.e2e-spec.ts` › US19-1 sem parâmetros, 24 h da grandeza da última leitura, em blocos de 5 min<br>`us19.e2e-spec.ts` › US19-1 7 e 30 dias usam blocos de 1 h e só as leituras do período<br>`us19.e2e-spec.ts` › US19-1 recusa período inválido, grandeza sem leitura e dispositivo inexistente<br>`us19.e2e-spec.ts` › US19-1 dispositivo sem leituras devolve o histórico vazio, sem grandeza |
| Execução | automatizado e manual; manual: Tela do histórico. Tela: Dispositivos e histórico, cerca de 10 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-130 — Mostrar a linha do limite das regras ativas

| Campo | Valor |
|---|---|
| História | US19 · estendido |
| Prioridade · técnica | média · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir o histórico de PM2.5 da EA-03. |
| Resultado esperado | Linha tracejada da regra ativa (55 µg/m³) e legenda; regras desativadas não aparecem. |
| Teste automatizado | `us19.e2e-spec.ts` › US19-2 traz as regras ativas da grandeza, sem as desativadas |
| Execução | automatizado e manual; manual: Linhas tracejadas no gráfico. Tela: Dispositivos e histórico, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-131 — Mostrar o minigráfico das últimas 3 h

| Campo | Valor |
|---|---|
| História | US19 · estendido |
| Prioridade · técnica | baixa · Particionamento (classes válida e inválidas) |
| Pré-condições | Ambiente completo no ar; administrador do `.env` autenticado na tela. |
| Entradas e passos | Abrir Dispositivos com o simulador ligado. |
| Resultado esperado | Coluna "Últimas 3 h" com nove barras de 20 min; "–" sem leitura. |
| Teste automatizado | `us19.e2e-spec.ts` › US19-3 nove médias de 20 min na grandeza da última leitura, nulas onde não houve leitura |
| Execução | automatizado e manual; manual: Barrinha na tela. Tela: Dispositivos e histórico, cerca de 5 min. |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-132 — Agregar no banco os períodos longos

| Campo | Valor |
|---|---|
| História | US19 · estendido |
| Prioridade · técnica | média · Valor limite |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). |
| Entradas e passos | Mil leituras em 30 dias; pedir o histórico de 30 dias. |
| Resultado esperado | No máximo um ponto por hora, somando as mil leituras; mínimo ≤ média ≤ máximo. |
| Teste automatizado | `us19.e2e-spec.ts` › US19-4 mil leituras em 30 dias chegam como no máximo um ponto por hora |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-133 — Ocorrência O1: aberta, primeira providência, em atendimento

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Ocorrência registrada. |
| Entradas e passos | Registrar providência sem situação. |
| Resultado esperado | Em atendimento. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-3 a primeira providência de uma ocorrência aberta passa para em atendimento |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-134 — Ocorrência O2: em atendimento, nova providência, em atendimento

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Ocorrência registrada. |
| Entradas e passos | Registrar outra providência. |
| Resultado esperado | Continua em atendimento e entra no histórico. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-3 providência em atendimento mantém a situação e também entra no histórico |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-135 — Ocorrência O3: voltar para aberta, recusado

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Ocorrência registrada. |
| Entradas e passos | Registrar providência com situação "aberta". |
| Resultado esperado | 400; situação inalterada. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-3 providência vazia ou situação inválida é recusada |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-136 — Ocorrência O4: encerrar sem observação, recusado

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Ocorrência registrada. |
| Entradas e passos | Encerrar sem texto. |
| Resultado esperado | 400; continua aberta. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-4 sem observação o encerramento é recusado |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-137 — Ocorrência O5: aberta, encerrar com observação, encerrada

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Ocorrência registrada. |
| Entradas e passos | Encerrar direto com observação. |
| Resultado esperado | Encerrada, com data; alertas em atendimento encerrados. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-4 encerrar grava a data e encerra só os alertas vinculados em atendimento |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-138 — Ocorrência O6: encerrada, nova providência, recusado

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Ocorrência registrada. |
| Entradas e passos | Registrar providência numa encerrada. |
| Resultado esperado | 409; continua encerrada. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-4 ocorrência encerrada não aceita outra atualização |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |

### CT-139 — Alerta T7: em atendimento, encerrar a ocorrência vinculada, encerrado

| Campo | Valor |
|---|---|
| História | US06 · estendido |
| Prioridade · técnica | alta · Transição de estados |
| Pré-condições | Banco de teste recriado (seção 1.4 do plano). Ocorrência registrada. Alerta em atendimento vinculado. |
| Entradas e passos | Encerrar a ocorrência. |
| Resultado esperado | Alerta encerrado; um alerta aberto vinculado continua aberto. |
| Teste automatizado | `us06.e2e-spec.ts` › US06-4 encerrar grava a data e encerra só os alertas vinculados em atendimento |
| Execução | automatizado |
| Na execução | resultado obtido · passou, falhou ou bloqueado · evidência (checkpoint 2) |
