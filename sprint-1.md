# Sprint 1 — Personas e Histórias de Usuário

**Smart City Operations Center**

Centro Universitário de Maringá — UniCesumar  
Curso de Engenharia de Software  
Experiência Profissional: Fábrica de Software  
Ponta Grossa, 2026

---

## 1 IDENTIFICAÇÃO DO PROJETO

| Item | Descrição |
|---|---|
| Nome do projeto | Smart City Operations Center |
| Tema | Projeto 4 - Smart City Operations Center |
| Instituição | UniCesumar - Centro Universitário de Maringá, unidade Ponta Grossa (PR) |
| Curso | Engenharia de Software |
| Disciplina | Experiência Profissional: Fábrica de Software |
| Entregável | Sprint 1 - Personas e histórias de usuário |
| Cidade de referência | Ponta Grossa, Paraná |
| Repositório | https://github.com/Sivwen0741/projeto-smart-city |
| Quadro Kanban | https://trello.com/b/tzN6oUT8 |
| Versão do documento | 1.0 |
| Data | 13 de agosto de 2026 |

## 2 EQUIPE

| Integrante | Atribuição no projeto |
|---|---|
| Bryan Charles | Desenvolvimento backend e frontend |
| Guilherme Eidam | Documentação |
| Guilherme Sartori | Testes e qualidade |
| Taynah Cruz | Gerência de projeto |

## 3 PERSONAS

As personas descritas a seguir representam os perfis de usuário previstos no documento de visão do projeto. Cada uma corresponde a um órgão ou função distinta da administração municipal e utiliza um conjunto próprio de funcionalidades da plataforma, o que orienta a priorização das histórias apresentadas na seção seguinte.

### 3.1 Persona 1 - Ricardo Menezes

| Campo | Descrição |
|---|---|
| **Nome** | Ricardo Menezes, 34 anos |
| **Função** | Operador do Centro Integrado de Operações Urbanas, escala de plantão |
| **Responsabilidades** | Acompanhar o painel durante todo o turno, triar os alertas gerados pela plataforma, registrar as ocorrências identificadas e encaminhar as equipes de campo ao local do evento |
| **Necessidades** | Enxergar em uma única tela tudo o que está acontecendo na cidade, saber imediatamente o que é mais grave e ter certeza de que nenhuma ocorrência ficou sem atendimento |
| **Problemas enfrentados** | Precisa alternar entre sistemas de órgãos diferentes durante o plantão, recebe informações por telefone e mensagem sem registro formal e perde tempo confirmando se um evento já foi atendido por outra equipe |
| **Funcionalidades utilizadas** | Mapa interativo, painel de alertas ativos, reconhecimento de alertas, registro e atualização de ocorrências, filtros por bairro e categoria, consulta ao estado dos dispositivos |

### 3.2 Persona 2 - Helena Baptista

| Campo | Descrição |
|---|---|
| **Nome** | Helena Baptista, 45 anos |
| **Função** | Coordenadora da Defesa Civil municipal |
| **Responsabilidades** | Monitorar o risco hidrológico do município, acionar as equipes em episódios de chuva intensa e decidir sobre alertas à população e interdição de vias |
| **Necessidades** | Acompanhar o nível dos rios junto da previsão de chuva, ser avisada antes de a situação se agravar e consultar o que ocorreu em eventos anteriores para antecipar as áreas mais afetadas |
| **Problemas enfrentados** | Depende de aviso de morador ou de equipe em campo para saber que uma via alagou, e o histórico de enchentes está espalhado em relatórios avulsos que não permitem comparação entre episódios |
| **Funcionalidades utilizadas** | Monitoramento de nível e vazão dos rios, previsão meteorológica, alertas de risco de enchente, filtros por período e por bairro |

### 3.3 Persona 3 - Sérgio Andrade

| Campo | Descrição |
|---|---|
| **Nome** | Sérgio Andrade, 52 anos |
| **Função** | Secretário municipal de Mobilidade e Trânsito |
| **Responsabilidades** | Definir prioridades de intervenção viária, distribuir as equipes de sinalização e prestar contas dos resultados da secretaria à administração municipal |
| **Necessidades** | Visão consolidada dos indicadores da cidade, identificação das regiões que concentram ocorrências e material objetivo para embasar decisões e apresentações |
| **Problemas enfrentados** | Recebe números fechados apenas no fim do mês, não consegue comparar períodos com facilidade e decide sobre sinalização e obras com base em percepção das equipes, sem dado acumulado |
| **Funcionalidades utilizadas** | Painel de indicadores-chave, mapa de calor das ocorrências, monitoramento de fluxo de veículos, comparação entre períodos, relatórios gerenciais em PDF |

### 3.4 Persona 4 - Camila Ferraz

| Campo | Descrição |
|---|---|
| **Nome** | Camila Ferraz, 29 anos |
| **Função** | Analista ambiental da Secretaria de Meio Ambiente |
| **Responsabilidades** | Acompanhar a qualidade do ar e os índices de ruído urbano, instruir processos de fiscalização e produzir os relatórios técnicos da secretaria |
| **Necessidades** | Séries históricas confiáveis das variáveis ambientais, com origem identificada, e aviso automático quando um índice ultrapassa o limite estabelecido |
| **Problemas enfrentados** | Trabalha com planilhas preenchidas manualmente, sem padronização entre pontos de coleta, e só descobre um episódio de poluição depois que ele já passou |
| **Funcionalidades utilizadas** | Monitoramento da qualidade do ar e do ruído, gráficos históricos, alertas ambientais, filtros por período e por bairro |

### 3.5 Persona 5 - Diego Prestes

| Campo | Descrição |
|---|---|
| **Nome** | Diego Prestes, 38 anos |
| **Função** | Analista do Departamento de Tecnologia da Informação da prefeitura |
| **Responsabilidades** | Manter a plataforma no ar, cadastrar dispositivos e usuários, configurar as regras de alerta e responder pela segurança e pelo controle de acessos |
| **Necessidades** | Saber rapidamente quando uma integração externa ou um dispositivo para de responder, conceder acesso conforme o órgão do servidor e ter rastreabilidade de quem fez o quê no sistema |
| **Problemas enfrentados** | Não tem visibilidade das falhas de comunicação até que um usuário reclame, e os acessos hoje são concedidos sem distinção de perfil, o que expõe informações a quem não precisa delas |
| **Funcionalidades utilizadas** | Cadastro de dispositivos, bairros e estações, gestão de usuários e perfis, configuração dos limites de alerta, log de atividades |

## 4 PRODUCT BACKLOG

O backlog reúne 24 histórias de usuário derivadas do escopo definido no documento de visão, abrangendo os módulos de cadastros, coleta e ingestão de dados, painel de monitoramento, gestão de ocorrências, motor de alertas, integrações externas, relatórios e segurança. A prioridade alta identifica as funcionalidades sem as quais a plataforma não cumpre seu propósito de supervisão urbana em tempo real; a prioridade média reúne recursos de análise e gestão que agregam valor após o núcleo estar operante; e a prioridade baixa concentra funcionalidades complementares, previstas para as últimas sprints.

| ID | Persona | História de usuário | Prioridade |
|---|---|---|---|
| US01 | Ricardo Menezes | Como operador, quero visualizar em um mapa interativo todos os dispositivos e as ocorrências registradas, para identificar rapidamente onde a cidade demanda atenção. | Alta |
| US02 | Ricardo Menezes | Como operador, quero ver a lista de alertas ativos ordenados por nível de criticidade, para atender primeiro as situações mais graves. | Alta |
| US03 | Ricardo Menezes | Como operador, quero receber os novos alertas na tela em tempo real, para agir sem precisar recarregar o painel. | Alta |
| US04 | Ricardo Menezes | Como operador, quero reconhecer um alerta e registrar a providência adotada, para documentar o atendimento e evitar acionamento duplicado. | Alta |
| US05 | Ricardo Menezes | Como operador, quero registrar manualmente uma ocorrência informada por telefone, para que eventos não detectados por sensores também entrem no histórico. | Alta |
| US06 | Ricardo Menezes | Como operador, quero atualizar a situação de uma ocorrência até a resolução, para acompanhar o ciclo de vida completo do atendimento. | Alta |
| US07 | Ricardo Menezes | Como operador, quero ser avisado quando um dispositivo parar de enviar dados, para verificar se houve falha de comunicação ou de equipamento. | Alta |
| US08 | Ricardo Menezes | Como operador, quero filtrar dispositivos e ocorrências por bairro, categoria, período e tipo de dispositivo, para focar apenas na região sob atendimento. | Média |
| US09 | Helena Baptista | Como coordenadora da Defesa Civil, quero acompanhar o nível e a vazão dos rios em tempo real, para avaliar o risco de transbordamento. | Alta |
| US10 | Helena Baptista | Como coordenadora da Defesa Civil, quero receber alerta automático de risco de enchente, para acionar as equipes antes de a via ser tomada pela água. | Alta |
| US11 | Helena Baptista | Como coordenadora da Defesa Civil, quero consultar a previsão meteorológica dos próximos dias, para planejar o plantão em períodos de chuva intensa. | Média |
| US12 | Sérgio Andrade | Como secretário de Mobilidade, quero visualizar um painel com os indicadores-chave da cidade, para acompanhar a situação geral sem depender de relatório mensal. | Alta |
| US13 | Sérgio Andrade | Como secretário de Mobilidade, quero acompanhar o fluxo de veículos e os congestionamentos nas vias monitoradas, para redirecionar equipes de sinalização. | Alta |
| US14 | Sérgio Andrade | Como secretário de Mobilidade, quero ver um mapa de calor das ocorrências, para identificar as regiões que concentram maior demanda por intervenção. | Média |
| US15 | Sérgio Andrade | Como secretário de Mobilidade, quero comparar indicadores entre dois períodos, para avaliar se as intervenções realizadas surtiram efeito. | Média |
| US16 | Sérgio Andrade | Como secretário de Mobilidade, quero gerar um relatório gerencial em PDF do período selecionado, para apresentar resultados à administração municipal. | Média |
| US17 | Camila Ferraz | Como analista ambiental, quero acompanhar os índices de qualidade do ar por região da cidade, para identificar áreas com maior exposição da população. | Alta |
| US18 | Camila Ferraz | Como analista ambiental, quero receber alerta quando a poluição atmosférica ultrapassar o limite configurado, para instruir a fiscalização no mesmo dia. | Alta |
| US19 | Camila Ferraz | Como analista ambiental, quero visualizar o gráfico histórico de uma variável monitorada, para analisar sua evolução ao longo do tempo. | Alta |
| US20 | Diego Prestes | Como analista de TI, quero autenticar os usuários com credenciais individuais, para garantir que apenas servidores autorizados acessem a plataforma. | Alta |
| US21 | Diego Prestes | Como analista de TI, quero gerenciar usuários e perfis de acesso vinculados a cada órgão, para restringir as informações conforme a função do servidor. | Alta |
| US22 | Diego Prestes | Como analista de TI, quero cadastrar, editar e inativar dispositivos informando sua localização geográfica, para manter a base fiel à infraestrutura instalada. | Alta |
| US23 | Diego Prestes | Como analista de TI, quero configurar os limites que disparam cada regra de alerta, para ajustar a sensibilidade do sistema sem alteração de código. | Alta |
| US24 | Diego Prestes | Como analista de TI, quero consultar o log das atividades realizadas pelos usuários, para manter a rastreabilidade das ações no sistema. | Média |
