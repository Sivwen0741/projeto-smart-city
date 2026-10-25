# Coleta da vazão no Open-Meteo e tela de rios

- **Data:** 25/10/2026
- **Item:** US09, critérios 1 a 4 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

A US09 pede a vazão diária e a previsão de cheia do Open-Meteo (Flood API) para os pontos dos
arroios monitorados, gravadas com origem `open-meteo`, e uma tela que junte o nível dos sensores, a
vazão, a tendência da última hora e a cota. O uso do Open-Meteo foi aprovado em 24/10/2026: rotinas
agendadas, sem chave, testes com respostas simuladas. O DER já previa `fonte_dados` e
`leitura.fonte_dados_id`, ainda sem uso.

## Alternativas consideradas

1. **Cadastrar os pontos dos arroios numa tabela própria.** Duplicaria o que o sensor de nível já
   tem (posição, bairro, endereço) e pediria uma tela de cadastro que não existe.
2. **Gravar a previsão como leitura com data futura.** A previsão viraria a "última leitura" de um
   dispositivo e atrapalharia qualquer consulta por data.
3. **Ponto monitorado = sensor de nível de água; leitura passada em `leitura`, previsão numa tabela
   à parte** (escolhida).

## Decisão

- Pontos monitorados são os dispositivos cujo atributo `tipoGrandeza` é `nivel_agua`, em qualquer
  estado: sensor inativo continua sendo ponto, só sem nível. O nome mostrado é o primeiro trecho do
  endereço do sensor (por exemplo, "Arroio Olarias").
- `fonte_dados` ganha a linha "Open-Meteo Flood API" e as colunas `ultima_tentativa` e
  `ultimo_erro`; `ultima_coleta` fica sendo a da última coleta que deu certo.
- A vazão de cada dia até hoje vai para `leitura` (grandeza `vazao`, origem `open-meteo`, meio-dia
  local, com `fonte_dados_id`); um índice único deixa a coleta seguinte regravar o mesmo dia sem
  duplicar. Os dias seguintes vão para a tabela nova `previsao`.
- Leitura de fonte externa não muda `ultima_comunicacao` nem a última leitura do dispositivo, e
  ainda não passa pelo motor de alertas (a combinação com o nível é a US10).
- Rotina a cada 60 min (`OPEN_METEO_INTERVALO_MINUTOS`, zero desliga), com a primeira coleta logo
  depois da subida. Falha de rede, HTTP ou formato fica registrada e não interrompe a rotina.
- Tela `/rios`, aberta pelo indicador "Nível dos rios" do painel, conforme a prancheta. Ela se
  atualiza com os eventos `leitura:nova` (só leituras de nível disparam a consulta) e
  `coleta:open-meteo`, além dos alertas.

## Consequências

- O DER ganha `fonte_dados.ultima_tentativa`, `fonte_dados.ultimo_erro` e a tabela `previsao`;
  entram na regeneração do diagrama no fechamento da Sprint 6.
- A US17 (qualidade do ar) usa a mesma estrutura de fonte e coleta.
- A vazão do GloFAS tem resolução de cerca de 5 km: arroios pequenos e próximos podem receber o
  mesmo valor, como Ronda e Olarias no ambiente de desenvolvimento.
