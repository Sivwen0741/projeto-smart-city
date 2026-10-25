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
| **US03-2** | a mudança de situação feita por outro operador também chega em tempo real | O teste emite a mudança pelo serviço de eventos. As ações que mudam a situação (reconhecer, encerrar) são da US04 e da US28 e terão teste próprio da emissão. | Verificado, parcial até a US04 |
| **US03-3** | sem token, com token adulterado ou de usuário inativo, a conexão é recusada<br>com token válido, a conexão é aceita | — | Verificado |
| **US03-4** | o alerta emitido com a tela desconectada está na lista consultada ao reconectar | Tela: API parada, alerta criado no banco, API de volta; o alerta apareceu até 1 s depois de a API responder, com a lista da página e o contador do menu consultados juntos, o que indica a consulta disparada pela reconexão. A consulta de 15 s também teria trazido o alerta, mais tarde. | Verificado, tela manual |
