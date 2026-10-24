# DT01: controlador de iluminação como quinta especialização de dispositivo

- **Data:** 24/10/2026
- **Item:** DT01 (replanejamento da Sprint 4, seção 2.2); pré-requisito da TT02
- **Situação:** aceita

## Contexto

O protótipo mostra o dispositivo IL-118 como "Controlador de iluminação", categoria que não
existe entre as quatro especializações do diagrama de classes. Na Sprint 4 o tipo foi cadastrado
com campos provisórios (`2026-10-22-atributos-por-tipo.md`), sem intervalo de leitura e sem
grandeza medida. Com a ingestão de leituras da TT02, o controlador precisa dizer o que mede, para
que o motor de alertas possa avaliar as leituras dele.

O que os artefatos já dizem:

- Documento de Visão, seção 7.2: entre as variáveis monitoradas estão o "consumo energético da
  infraestrutura pública" e o "funcionamento da iluminação pública". A seção 7.5 cita "falhas na
  iluminação pública" entre os alertas.
- Protótipo: o IL-118 aparece com "Falha parcial · 9 pontos" (`05-dispositivos.svg`), e o alerta
  "Falha na iluminação pública" mostra "IL-118 · 9 pontos apagados" (`03-alertas.svg`,
  `02-painel.svg`).

## Alternativas consideradas

1. **Tratar o controlador como sensor urbano.** Ele ganharia `tipoGrandeza` livre, mas a
   quantidade de pontos controlados, que o protótipo mostra, não cabe em `SensorUrbano`.
2. **Deixar o controlador sem leitura, só com sinal de vida.** Impede o alerta "Falha na
   iluminação pública", que está no protótipo e na seção 7.5 da Visão.
3. **Quinta especialização `ControladorIluminacao`, que mede pontos apagados** (escolhida).

## Decisão

- O diagrama de classes ganha `ControladorIluminacao`, especialização de `Dispositivo`, com
  `quantidadePontos: int`, `intervaloLeituraSegundos: int` e `contarPontosApagados(): int`.
- No cadastro, `quantidadePontos` passa a ser obrigatório (mínimo 1) e
  `intervaloLeituraSegundos` é opcional. O tipo usa intervalo de 30 s, como os demais.
- Nova grandeza `pontos_apagados` (unidade "pontos"). O controlador mede `pontos_apagados` e
  `consumo_energia`. Assim, uma regra como "pontos apagados > 0" gera o alerta "Falha na
  iluminação pública".
- O tipo deixa de ser provisório. Como nenhum tipo continua provisório, a marca `provisoria` da
  API e o aviso do formulário foram removidos.

## Consequências

- `docs/diagrama-classes.drawio` e `.png` foram atualizados. A exportação em escala 2 falha na
  ferramenta usada (drawio desktop headless 1.50) até com o diagrama anterior, então o PNG passou
  a ser gerado em escala 1.
- `docs/Modelagem_Estrutural_e_de_Dados.pdf` continua sem a quinta especialização, como já estava
  sem os ajustes de esquema da Sprint 4.
- Dois testes da US22 mudaram junto: o que verificava o controlador como provisório passou a
  verificar os campos definidos aqui, e o caso de 30 minutos do critério US22-6 passou a usar um
  tipo de teste sem intervalo, porque o controlador agora tem intervalo.
- Um controlador cadastrado antes, sem `quantidadePontos`, continua gravado, mas precisa do campo
  na próxima edição.
