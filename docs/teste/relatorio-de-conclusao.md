# Relatório de conclusão — Sprint 6

Seção 5 da documentação de teste, fechada em 12/11/2026, depois da rodada 2.

**Resumo.** A versão `v1.0.2-sprint-6` está pronta para a entrega, com ressalvas. Os 139 casos
planejados foram executados, 136 passaram, todos os 78 de prioridade alta passaram e nenhum
incidente de severidade alta foi registrado. Ficam abertos quatro incidentes, dois médios (INC-007 e
INC-008) e dois baixos (INC-005 e INC-006). A verificação de tela foi feita por um único integrante,
por automação de navegador, sem a independência que o plano previa.

## 5.1 Métricas

| Métrica | Valor |
|---|---|
| Casos executados / planejados | 139 / 139 (100%). Rodada 1 (02/11, `v1.0-sprint-6`): os 75 casos só automatizados, a parte automatizada dos 57 casos "automatizado e manual" e o ensaio do CT-005. Rodada 2 (12/11, `v1.0.2-sprint-6`): a parte de tela dos 57, os 6 só manuais e a parte do painel do CT-005. |
| Taxa de aprovação ao final | 136 de 139 (97,8%). Falharam CT-018, CT-111 e CT-127, todos de prioridade média. Prioridade alta: 78 de 78 (100%). |
| Incidentes registrados | 8: alta 0, média 2 (INC-007, INC-008), baixa 6 (INC-001 a INC-006). |
| Incidentes abertos | 4: alta 0, média 2 (INC-007, INC-008), baixa 2 (INC-005, INC-006). INC-001 a INC-004 foram fechados depois do reteste. |
| Testes automatizados | Unidade: 53 testes, 53 aprovados; cobertura de 98,3% das instruções, 81,44% dos desvios, 95,91% das funções e 98,79% das linhas (rodada 1); de novo 53/53, com a mesma cobertura, na `v1.0.2-sprint-6` em 12/11. Integração e sistema: 216 testes; 216 aprovados na rodada 1 e em todos os retestes, e 216/216 em cada uma das cinco execuções seguidas na `v1.0.2-sprint-6`, em 12/11, com o banco de teste recriado antes de cada uma. Postman pelo Newman: 74 requisições, 133 verificações, 133 aprovadas (rodada 1). |
| Histórias cobertas por pelo menos um caso | 21 de 21 itens do escopo: 11 do núcleo (TT01, US20, US22, US23, TT02, US01, US02, US03, US28, US04, US05) e 10 do estendido (TT02-9, US06, US07, US09, US10, US12, US26, US21, US18, US19). Os elementos de tela de US08, US16 e US25, do backlog, têm o CT-082. |

## 5.2 Avaliação dos critérios de conclusão

| Critério (do plano) | Situação |
|---|---|
| 1. Todos os casos de prioridade alta aprovados | Atendido. Os 78 casos de prioridade alta passaram. Os três que falharam são de prioridade média. |
| 2. Nenhum incidente de severidade alta em aberto | Atendido. Nenhum incidente de severidade alta foi registrado. Estão abertos dois de severidade média e dois de severidade baixa. |
| 3. Suíte automatizada verde num banco de teste recriado, na versão final | Atendido. Na `v1.0.2-sprint-6`, versão final, a suíte de integração e sistema deu 216/216 em cinco execuções seguidas, cada uma com o banco de teste recriado, e a de unidade deu 53/53. A coleção do Postman não foi repetida nessa versão: a última execução, 133 de 133 verificações, foi na `v1.0-sprint-6`, e as correções da `v1.0.2` não mudaram rotas da interface de programação. |
| 4. Cada história do núcleo coberta por ao menos um caso executado | Atendido. As 11 histórias e tarefas do núcleo têm casos executados. A US22 tem um caso que falhou (CT-018, INC-007), e os outros dez casos dela passaram. |

## 5.3 Desvios do plano

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
  [`distribuicao-manual.md`](distribuicao-manual.md), não se concretizou por indisponibilidade da
  equipe no período de execução. Os casos de verificação de tela foram executados por automação de
  navegador conduzida por um único integrante, Bryan Charles. No log, a coluna "Quem executou"
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

## 5.4 Riscos residuais

- **INC-005, data de instalação em formato americano (aberto, severidade baixa).** Num navegador
  com a interface em inglês, o campo "Instalado em" do formulário de dispositivo mostra a data em
  mês/dia/ano. O resto do sistema mostra dia/mês. O `lang="pt-BR"` do documento não muda isso no
  Chrome, e a correção exige trocar o campo nativo por um componente próprio. Em 02/11/2026 isso
  foi julgado mais arriscado que o defeito, a duas semanas da entrega. Efeito: quem usa o
  navegador em inglês pode ler ou digitar a data com dia e mês trocados; com o navegador em
  português, o campo já aparece em dia/mês.
- **INC-006, rótulo arredondado no eixo do gráfico de ocorrências do painel (aberto, severidade
  baixa).** A série e os totais estão corretos. A linha do meio do eixo vertical é rotulada com o
  valor arredondado, então quem lê pela grade encontra um número que a linha não marca. O mesmo
  componente desenha os gráficos dos rios e do histórico, onde os valores têm casas decimais e o
  efeito não apareceu na rodada 2.
- **INC-007, ordenação que ignora os acentos (aberto, severidade média).** Na lista de dispositivos,
  Tipo e Localização põem os nomes acentuados no fim, e a lista de tipos do formulário também. A
  causa é a collation do banco na imagem Alpine, e pode atingir outras ordenações por texto feitas
  no banco que a rodada não exercitou.
- **INC-008, alerta de poluição por bairro fora do mapa (aberto, severidade média).** O alerta
  aparece na lista, no painel do alerta, na faixa de indicadores e no quadro do painel, mas não no
  mapa, que é a visão de situação da cidade. Quem acompanha só o mapa não vê o alerta.
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
  do requisito pode passar pelo código, pelo teste e pela verificação ao mesmo tempo. A lacuna mais
  sensível continua sendo o README lido por quem nunca o viu, que é o avaliador.
- **Observações sem incidente.** Cinco imperfeições de aparência e de texto registradas no log da
  rodada 2, fora do que as fichas verificam: nomes centralizados quando quebram linha nas tabelas de
  regras e de usuários, "Administrador" passando da borda do botão de perfil, "1 pontos" e o
  cabeçalho "Últimas 3 h" quebrado na lista de dispositivos, mensagens de validação que ficam na tela
  depois da correção do campo e "Detalhes" de alerta aberto com o mesmo painel de "Reconhecer". Ficam
  para decisão: abrir como incidente ou levar ao backlog.

## 5.6 Recomendação

Liberar a `v1.0.2-sprint-6` para a entrega. Os quatro critérios de conclusão do plano estão
atendidos, e os quatro incidentes abertos têm contorno e estão descritos na 5.4.

Em seguida:

1. Decidir, com o tempo até 16/11, quais incidentes corrigir. O INC-006 e o INC-007 têm causa
   localizada e correção pequena. O INC-008 pede desenhar o alerta de bairro no mapa, o que é tela
   nova e precisa ser mostrado antes, pela regra do projeto.
2. Cada correção segue o processo das anteriores: branch própria com o número do incidente,
   reteste do caso que falhou e regressão com a suíte de unidade e a de integração num banco
   recriado. Os casos de tela de prioridade alta afetados pela correção são repetidos, e uma nova
   tag reúne as correções.
3. Na próxima entrega, executar o CT-005 e uma amostra dos casos de tela por outro integrante, para
   fechar o DT08 e reduzir o risco do DT06.
