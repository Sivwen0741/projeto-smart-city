# Alerta de poluição por bairro

- **Data:** 27/10/2026
- **Item:** US18, critérios 1 a 3, e a coleta do critério US17-1 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

A US18 pede que as regras de PM2.5 e PM10 da US23 valham também para as leituras do Open-Meteo de
cada bairro. Essas leituras não existiam: a coleta é o critério US17-1, e a US17 ficou fora da
ordem da reta final (US21, US18, US19). No DER, `leitura` e `alerta` pertencem sempre a um
dispositivo, e o Open-Meteo dá a qualidade do ar de um ponto, sem dispositivo.

## Alternativas consideradas

1. **Um dispositivo fictício por bairro.** Apareceria na lista de dispositivos, no mapa e na
   contagem do painel, e cairia na regra de sem comunicação da US07: seria dado inventado.
2. **Prender a leitura à estação ambiental do bairro.** Só três bairros têm estação.
3. **Leitura e alerta passam a ter dispositivo ou bairro** (escolhida).

## Decisão

- **Modelo (migração `QualidadeDoArPorBairro`):** `leitura.bairro_id` e `alerta.bairro_id`, com
  `dispositivo_id` passando a aceitar nulo e uma restrição que exige um dos dois. Leitura do bairro
  é única por bairro, grandeza, hora e fonte. Um alerta ativo por regra e bairro, como já era por
  regra e dispositivo. Divergência do DER, a acrescentar na regeneração do diagrama.
- **Coleta (US17-1, sem a camada do mapa):** a cada 60 min (`OPEN_METEO_INTERVALO_MINUTOS`), uma
  única requisição à Air Quality API com o ponto interno de cada um dos 16 bairros
  (`ST_PointOnSurface`), PM2.5 e PM10 por hora das últimas 24 h até agora, gravados com origem
  `open-meteo` e a fonte "Open-Meteo Air Quality API". Uma requisição para todos os bairros
  respeita o limite diário da fonte. Horas futuras da resposta são descartadas. Falha fica em
  `fonte_dados.ultimo_erro`, como na US09.
- **Regras (US18-1):** o motor de alertas avalia a hora mais recente de cada bairro, com o mesmo
  operador, limite, duração mínima (horas seguidas acima) e encerramento por normalização dos não
  graves (US28).
- **Alerta (US18-2):** sem dispositivo, aparece como "Open-Meteo" no lugar do código, com o bairro
  e a fonte; a posição no mapa é o ponto interno do bairro. No painel do alerta, o campo
  "Dispositivo" vira "Fonte".
- **Órgão sugerido (US18-3):** alerta de `pm25` ou `pm10`, de dispositivo ou de bairro, traz o Meio
  Ambiente como órgão sugerido e "Qualidade do ar" como categoria no registro da ocorrência; o
  operador pode trocar.

## Consequências

- A camada "Qualidade do ar" do mapa (US17-2 e US17-3) não foi feita; os dados que ela usaria já
  são coletados.
- O índice não é gravado: o IQAr é calculado na leitura, pelo módulo único
  (`2026-10-27-indice-de-qualidade-do-ar.md`).
- Consultas que partem do dispositivo (lista, mapa, painel, US07) continuam ignorando as leituras
  por bairro. As que partem do alerta passaram a aceitar alerta sem dispositivo.
- O `beforeAll` da US10 apagava todas as leituras de fonte externa para tirar a vazão da US09 (DT07).
  Com alertas apontando para leituras do ar, isso violava a chave estrangeira; a limpeza ficou só
  na vazão, que é o que o comentário do teste diz limpar.
