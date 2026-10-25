# Verificação dos critérios de aceite da Sprint 5

Relação entre os critérios de [`sprint-5-criterios.md`](sprint-5-criterios.md) e a forma como cada
um foi verificado. Este documento cresce a cada item mesclado na `main`.

- **Testes automatizados:** casos e2e em `api/test/`, com o número do critério no nome. Para
  rodar, veja a seção "Testes automatizados" do [README](../README.md).
- **Verificação manual:** feita pelo autor do código, contra uma cópia isolada do ambiente
  (`docker compose -p ...`), nos critérios que dependem do ambiente completo.
- **Revisão:** como na Sprint 4, nenhum item desta sprint teve revisão de outro integrante. A
  pendência segue no DT06 ([`verificacao-sprint-4.md`](verificacao-sprint-4.md)).

## TT02 - Camada de ingestão e motor de alertas

Mesclada em 24/10/2026. Suíte completa: 80 testes passando (68 da Sprint 4 e 12 da TT02) num banco
de teste recriado. Decisões em [`2026-10-24-ingestao-mqtt.md`](decisoes/2026-10-24-ingestao-mqtt.md).

| Critério | Teste automatizado (`tt02.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **TT02-1** | grava grandeza, valor, unidade, origem mqtt e o horário da medição<br>a estação ambiental envia várias grandezas na mesma mensagem | — | Verificado |
| **TT02-2** | o dispositivo passa de sem comunicação a operando<br>câmera e semáforo mandam só sinal de vida, sem leitura | — | Verificado |
| **TT02-3** | mensagem inválida é descartada sem derrubar o assinante e fica registrada no log | Ensaio de 24/10/2026: `mosquitto_pub` de SN-019 (inativo) gerou `mensagem descartada de SN-019: dispositivo inativo`. | Verificado |
| **TT02-4** | a condição precisa durar o tempo mínimo da regra, e a duração zero dispara na primeira leitura<br>uma leitura dentro do limite reinicia a contagem da duração<br>regra desativada e regra de outra grandeza não disparam<br>dispositivo em manutenção grava a leitura e não gera alerta | — | Verificado |
| **TT02-5** | o alerta guarda regra, dispositivo, leitura, valor observado e a cópia de operador, limite e gravidade | — | Verificado |
| **TT02-6** | enquanto o alerta está ativo, novas leituras fora do limite não abrem outro | Também garantido pelo índice único parcial `alerta_ativo_uq`, que o teste exercita. | Verificado |
| **TT02-7** | depois de uma queda da conexão com o broker, reconecta sozinho e volta a gravar | O teste derruba a conexão do cliente; não derruba o contêiner do broker. | Verificado |
| **TT02-8** | `us22.e2e-spec.ts` › US22-6 a subida não renova a última comunicação dos exemplos: só a ingestão a atualiza | Ensaio de 24/10/2026 numa cópia isolada da branch: o `simulador` subiu com o compose e publicou pelos 10 exemplos. A API mostrou 9 operando, EA-07 e SN-027 sem comunicação, IL-118 em manutenção e SN-019 inativo, como previsto. Alertas ao vivo: chuva forte (EA-02, grave) 2 min depois da subida do simulador, sem duração mínima; nível do arroio (SN-014, grave) às 23:28:03, 10 min depois da primeira leitura acima da cota (23:18:02), como a regra pede. O simulador não tem teste automatizado. | Verificado, simulador manual |

O teste da US22-6 que verificava a renovação a cada subida foi trocado pelo comportamento novo,
como previa [`2026-10-22-dados-de-demonstracao.md`](decisoes/2026-10-22-dados-de-demonstracao.md).
A Sprint 4 continua com 68 testes.

## US01 - Mapa interativo com dispositivos e ocorrências

Mesclada em 24/10/2026. Suíte completa: 87 testes passando. Decisões em
[`2026-10-24-mapa-da-cidade.md`](decisoes/2026-10-24-mapa-da-cidade.md). A verificação de tela foi
feita no Chrome (macOS), numa cópia isolada da branch com o simulador ligado, um alerta grave, um
de atenção e uma ocorrência inseridos só nesse banco.

| Critério | Teste automatizado (`us01.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US01-1** | a cor do marcador sai da maior gravidade entre os alertas ativos<br>a listagem informa o estado, para o mapa deixar de fora os inativos | Tela: 12 marcadores (o inativo fora), SN-014 vermelho com halo, legenda "Grave · 1, Atenção · 1, Normal · 7, Sem comunicação ou manutenção · 3". | Verificado, tela manual |
| **US01-2** | lista as não encerradas, com coordenada, e deixa de fora as encerradas<br>a listagem de ocorrências exige token | Tela: a ocorrência aparece como anel vermelho no Centro, acima dos dispositivos. | Verificado, tela manual |
| **US01-3** | o dispositivo traz código, tipo, bairro, situação e a última leitura<br>a ocorrência traz protocolo, categoria, gravidade e situação | Tela: clique na CAM-08 mostrou "CAM-08 · câmera / Av. Carlos Cavalcanti, 4748, Uvaranas / Operando · comunicação há 22 s". | Verificado, tela manual |
| **US01-4** | os limites dos bairros vêm da base territorial, com o ponto do rótulo dentro de cada um | Tela: contornos tracejados e nomes em caixa alta. | Verificado, tela manual |
| **US01-5** | — | Tela: marcadores próximos do Centro agrupados em "3" e no sul em "2"; grave e atenção ficam fora dos grupos. | Verificado, só manual |
| **US01-6** | — | Tela: o alerta inserido no banco mudou a cor do SN-014 e a legenda em até 15 s, sem recarregar. | Verificado, só manual |

A automação das verificações de tela continua no DT05.

## US02 - Lista de alertas ativos ordenados por gravidade

Mesclada em 24/10/2026. Suíte completa: 93 testes passando. Decisões em
[`2026-10-24-lista-de-alertas.md`](decisoes/2026-10-24-lista-de-alertas.md). A verificação de tela
foi feita no Chrome, numa cópia isolada da branch com quatro alertas e uma ocorrência inseridos só
nesse banco.

| Critério | Teste automatizado (`us02.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US02-1** | cada alerta traz gravidade, regra, dispositivo, bairro, medição com limite, detecção, órgão e situação<br>o órgão vem da ocorrência vinculada ao alerta<br>as visões separam ativos, em atendimento e encerrados hoje | Tela: colunas do protótipo; "Meio Ambiente" no alerta vinculado à ocorrência; "–" nos demais. | Verificado, tela manual |
| **US02-2** | a ordem é grave, atenção e informativo, e o mais recente primeiro na mesma gravidade | Tela: grave no topo, atenção em seguida, do mais recente ao mais antigo. | Verificado |
| **US02-3** | os indicadores contam ativos, graves sem reconhecimento, em atendimento, encerrados, tempo até o reconhecimento e 24 h<br>os dispositivos sem comunicação são contados por tipo | Tela: "3 alertas ativos agora, 1 grave sem reconhecimento", "12 min", "4 alertas nas últimas 24 h, 1 já encerrado", "2 dispositivos sem comunicação, 1 estação ambiental e 1 sensor de nível". | Verificado, tela manual |
| **US02-4** | — (o painel usa a mesma rota da tela de alertas) | Tela: a fila do painel mostrou os mesmos três alertas na mesma ordem, com "3 · 1 grave". | Verificado, só manual |

## US03 - Novos alertas na tela em tempo real

Mesclada em 24/10/2026. Suíte completa: 98 testes passando. Decisões em
[`2026-10-24-tempo-real.md`](decisoes/2026-10-24-tempo-real.md). Verificação de tela no Chrome,
numa cópia isolada da branch, com o simulador parado para controlar as leituras.

| Critério | Teste automatizado (`us03.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US03-1** | o alerta novo chega à tela em até 2 segundos depois da leitura que o disparou | Tela: `mosquitto_pub` de 62 mm no EA-02 com a tela de alertas aberta; "Chuva forte acumulada" apareceu 0,2 s depois do fim da publicação, sem recarregar, e o contador do menu foi para 1. | Verificado, tela manual |
| **US03-2** | a mudança de situação feita por outro operador também chega em tempo real | O teste emite a mudança pelo serviço de eventos. As ações que mudam a situação (reconhecer, encerrar) são da US04 e da US28 e terão teste próprio da emissão. | Verificado; o teste da emissão pelo reconhecimento real entrou com a US04 |
| **US03-3** | sem token, com token adulterado ou de usuário inativo, a conexão é recusada<br>com token válido, a conexão é aceita | — | Verificado |
| **US03-4** | o alerta emitido com a tela desconectada está na lista consultada ao reconectar | Tela: API parada, alerta criado no banco, API de volta; o alerta apareceu até 1 s depois de a API responder, com a lista da página e o contador do menu consultados juntos, o que indica a consulta disparada pela reconexão. A consulta de 15 s também teria trazido o alerta, mais tarde. | Verificado, tela manual |

## US28 - Alerta grave visível até ser reconhecido

Mesclada em 24/10/2026. Suíte completa: 105 testes passando. Decisões em
[`2026-10-24-alerta-grave-persistente.md`](decisoes/2026-10-24-alerta-grave-persistente.md). Tela
verificada no Chrome, numa cópia isolada da branch, com o simulador parado.

| Critério | Teste automatizado (`us28.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US28-1** | atenção e informativo sem reconhecimento são encerrados quando a leitura volta ao normal<br>o alerta grave sem reconhecimento nunca é encerrado automaticamente<br>o alerta já reconhecido não é encerrado pela normalização<br>a normalização usa o limite copiado no disparo, não o da regra editada | Tela: leitura de 38 km/h no SN-031 tirou "Tráfego lento" da lista 0,1 s depois da publicação; 2 mm no EA-02 não tirou "Chuva forte acumulada". O ensaio achou um defeito (o encerramento avisava a tela com identificador vazio), corrigido antes do merge, com o teste reforçado para verificar o identificador. | Verificado, tela manual |
| **US28-2** | o resumo informa a quantidade e o grave sem reconhecimento mais antigo, para a faixa | Tela: "1 alerta grave sem reconhecimento · há 23 s · Chuva forte acumulada · EA-02 · Olarias · 62 mm", sem botão de fechar, na tela de alertas e na de dispositivos. | Verificado, tela manual |
| **US28-3** | a faixa vem do servidor: outro usuário, com outro login, vê o mesmo alerta grave | Tela: a faixa continuou depois de recarregar a página em outra tela. | Verificado, tela manual |
| **US28-4** | o grave sem reconhecimento fica no topo, acima até de um grave mais recente já em atendimento | Tela: marca "fixo até reconhecer" no grave aberto. | Verificado, tela manual |

## US04 - Reconhecer um alerta e registrar a providência

Mesclada em 24/10/2026. Suíte completa: 112 testes passando. Decisões em
[`2026-10-24-reconhecimento-de-alerta.md`](decisoes/2026-10-24-reconhecimento-de-alerta.md). Tela
verificada no Chrome, numa cópia isolada da branch, com o simulador parado.

| Critério | Teste automatizado (`us04.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US04-1** | o reconhecimento exige a providência adotada | Tela: "Confirmar reconhecimento" sem texto marcou o campo com "Informe a providência adotada." | Verificado, tela manual |
| **US04-2** | grava o usuário, a data e a hora e a providência, e o alerta passa a em atendimento | Tela: aberto pela faixa ("Ver alerta"), reconhecido com texto; o painel passou a "Alerta reconhecido · Administrador · 22:04", a linha a "Em atendimento" e a faixa sumiu. | Verificado, tela manual |
| **US04-3** | a segunda tentativa é recusada com a mensagem de quem reconheceu e quando<br>duas tentativas simultâneas: só uma é aceita<br>alerta encerrado ou inexistente não é reconhecido | Tela: com o painel aberto e texto digitado, o alerta foi reconhecido por fora (API); o painel avisou "foi reconhecido por Administrador às 22:05 enquanto você escrevia. A sua providência não foi gravada." e mostrou a providência que valeu. O ensaio mostrou que, antes do ajuste, o texto digitado era descartado sem aviso. | Verificado, tela manual |
| **US04-4** | o reconhecimento gera registro no log de atividades | — | Verificado |
| **US03-2** | `us04.e2e-spec.ts` › US03-2 o reconhecimento feito por um operador chega aos outros em tempo real | Completa o critério que estava parcial na US03. | Verificado |

## US05 - Registrar manualmente uma ocorrência informada por telefone

Mesclada em 24/10/2026. Suíte completa: 124 testes passando. Decisões em
[`2026-10-24-ocorrencia-manual.md`](decisoes/2026-10-24-ocorrencia-manual.md). Tela verificada no
Chrome, numa cópia isolada da branch, com o simulador parado.

| Critério | Teste automatizado (`us05.e2e-spec.ts` › caso) | Verificação manual ou observação | Situação |
|---|---|---|---|
| **US05-1** | grava os campos e calcula o bairro pela localização<br>as listas de categorias e de órgãos vêm da interface de programação<br>ponto na zona rural fica sem bairro | Tela: formulário aberto pelo menu sobre o painel; ponto marcado no mapa mostrou o bairro. | Verificado, tela manual |
| **US05-2** | o protocolo segue o formato do protótipo e é único, mesmo com registros simultâneos | Tela: "Protocolo 2026-10-0001". | Verificado, tela manual |
| **US05-3** | grava quem registrou, a origem telefone, a situação aberta e o primeiro registro do histórico | Tela: "Origem: Telefone". | Verificado |
| **US05-4** | sem categoria, sem gravidade ou sem localização é recusado com mensagem<br>ponto fora do município é recusado<br>órgão e descrição são opcionais | Tela: envio vazio marcou "Escolha a categoria.", "Escolha a gravidade." e "Marque a localização no mapa." | Verificado, tela manual |
| **US05-5** | o alerta fica vinculado e a origem é alerta<br>alerta já vinculado ou inexistente não abre outra ocorrência | Tela: reconhecimento com "Abrir ocorrência com este alerta" abriu o formulário preenchido; registrado como 2026-10-0002, "Origem: Alerta de EA-02", e a linha do alerta passou a mostrar "Defesa Civil". | Verificado, tela manual |
| **US05-6** | o registro gera entrada no log de atividades<br>a ocorrência nova chega às telas e aparece na lista do mapa | Tela: o anel da ocorrência apareceu no mapa do painel ao registrar, com a contagem na barra; o plural errado ("1 ocorrências abertas") foi corrigido antes do merge. | Verificado, tela manual |
