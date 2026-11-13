# Relatório de conclusão — Sprint 6

Seção 5 da documentação de teste, fechada em 13/11/2026, depois da rodada 2 e das correções
reunidas na tag `v1.0.3-sprint-6`.

**Resumo.** A versão `v1.0.3-sprint-6` está pronta para a entrega, com ressalvas. Os 139 casos
planejados foram executados. Na primeira execução, 136 passaram. Ao final, os 139 estão aprovados:
dois passaram no reteste depois da correção, e um passou na reavaliação, depois que a exigência que
o fez falhar se mostrou sem critério de origem. Nenhum incidente de severidade alta foi registrado, e
três de severidade baixa continuam abertos. A verificação de tela foi feita por um único integrante,
por automação de navegador, sem a independência que o plano previa.

## 5.1 Métricas

| Métrica | Valor |
|---|---|
| Casos executados / planejados | 139 / 139 (100%). Rodada 1 (02/11, `v1.0-sprint-6`): os 75 casos só automatizados, a parte automatizada dos 57 casos "automatizado e manual" e o ensaio do CT-005. Rodada 2 (12/11, `v1.0.2-sprint-6`): a parte de tela dos 57, os 6 só manuais e a parte do painel do CT-005. Retestes em 12 e 13/11 nas versões corrigidas. |
| Taxa de aprovação ao final | Primeira execução: 136 de 139 (97,8%). Após correção e reteste: 139 de 139 (100%). Falharam na primeira execução CT-018, CT-111 e CT-127, todos de prioridade média: CT-018 e CT-111 passaram no reteste depois das correções dos INC-007 e INC-006; CT-127 passou na reavaliação, porque a parte que falhou não tinha critério de origem (INC-008, reclassificado). Prioridade alta: 78 de 78 (100%), todos na primeira execução. |
| Incidentes registrados | 14. Um deles, o INC-008, foi reclassificado como achado investigado, porque nenhum critério o exige. Dos 13 defeitos: alta 0, média 1 (INC-007), baixa 12 (INC-001 a INC-006 e INC-009 a INC-014). Seis vieram dos casos especificados e seis do teste exploratório (INC-009 a INC-014). |
| Incidentes abertos | 3, todos de severidade baixa: INC-005 (data em mês/dia num navegador em inglês), INC-013 (mensagem de validação que fica na tela) e INC-014 ("Detalhes" de alerta aberto abre o painel de reconhecimento). Os outros dez foram fechados depois do reteste. |
| Testes automatizados | Na versão final, `v1.0.3-sprint-6` (13/11): unidade 56 de 56, com cobertura de 98,33% das instruções, 82,17% dos desvios, 96% das funções e 98,82% das linhas; integração e sistema 217 de 217, com o banco de teste recriado; coleção do Postman pelo Newman com 74 requisições e 133 de 133 verificações. Os quatro testes a mais (três de unidade e um de integração) vieram com a correção do INC-007. Na `v1.0.2-sprint-6` (12/11), a integração deu 216/216 em cinco execuções seguidas, cada uma com o banco recriado, e o Newman deu 133/133. |
| Histórias cobertas por pelo menos um caso | 21 de 21 itens do escopo: 11 do núcleo (TT01, US20, US22, US23, TT02, US01, US02, US03, US28, US04, US05) e 10 do estendido (TT02-9, US06, US07, US09, US10, US12, US26, US21, US18, US19). Os elementos de tela de US08, US16 e US25, do backlog, têm o CT-082. |

## 5.2 Avaliação dos critérios de conclusão

| Critério (do plano) | Situação |
|---|---|
| 1. Todos os casos de prioridade alta aprovados | Atendido. Os 78 casos de prioridade alta passaram, todos na primeira execução. |
| 2. Nenhum incidente de severidade alta em aberto | Atendido. Nenhum incidente de severidade alta foi registrado. Os três abertos são de severidade baixa. |
| 3. Suíte automatizada verde num banco de teste recriado, na versão final | Atendido. Na `v1.0.3-sprint-6`, a unidade deu 56/56, a integração e sistema 217/217 com o banco recriado e a coleção do Postman 133 de 133 verificações. |
| 4. Cada história do núcleo coberta por ao menos um caso executado | Atendido. As 11 histórias e tarefas do núcleo têm casos executados e aprovados. |

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
  (`evidencias/2026-11-13-recaptura-v1.0.2/`). As demais telas da rodada 2 têm o mesmo código nas
  duas versões.

## 5.4 Riscos residuais

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

## 5.5 Lições aprendidas

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

## 5.6 Recomendação

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
