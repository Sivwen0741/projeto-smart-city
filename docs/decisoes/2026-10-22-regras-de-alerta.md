# Regras de alerta por grandeza, sem exclusão e com cópia no alerta

- **Data:** 22/10/2026
- **Item:** US23, critérios 1 a 6
- **Situação:** aceita

## Contexto

A US23 pede que os limites de alerta sejam configurados pela interface, sem mudar código. O DER
liga `regra_alerta` à grandeza observada (`tipo_grandeza`), não a um dispositivo. A tela de regras
não existe no protótipo (DT03) e foi desenhada a partir do guia e da tela de dispositivos,
com aprovação antes da implementação.

## Alternativas consideradas

1. **Regra por dispositivo.** Daria limites diferentes para cada sensor, mas exige uma regra
   por equipamento e diverge do DER.
2. **Regra por tipo de dispositivo.** Não serve para a estação ambiental, que mede várias
   grandezas.
3. **Regra para a cidade toda, casada pela grandeza, como no DER** (escolhida).

## Decisão

- Uma regra vale para toda leitura da grandeza escolhida, de qualquer dispositivo. As grandezas
  são as de `api/src/grandezas.ts`, as mesmas dos atributos dos sensores.
- Não há rota de exclusão. A regra é desativada com `ativa = false` e continua listada,
  com a contagem dos alertas que já gerou (US23-3).
- O alerta guarda cópia do operador, do limite e da gravidade no momento do disparo
  (`2026-10-20-ajustes-der-sprint-4.md`), e por isso a edição da regra não altera alertas
  passados (US23-4). Como o motor de alertas é da Sprint 5, o teste simula o disparo copiando
  os valores da regra, como o motor deverá fazer.
- O limite vazio, o operador não selecionado e a duração negativa são barrados na tela, que
  desabilita o botão de salvar e diz qual campo corrigir, e também na API, que responde 400
  inclusive quando a edição envia `null` (US23-5). Duração zero é aceita e quer dizer
  "dispara na primeira leitura".
- Cada cadastro e cada alteração vão para o log com autor e só os campos que mudaram, com o
  valor anterior e o novo (US23-6). A tela mostra esse histórico no painel da regra.
- As gravidades seguem o DER: `grave`, `atencao` e `informativo`. O guia de identidade chama de
  "Normal" o estado dentro do limite, que é uma situação da leitura, não uma gravidade de regra.

## Consequências

- As seis regras da carga inicial (`api/src/database/seeds/regras-exemplo.seed.ts`) têm limites
  **ilustrativos**, tirados do desenho aprovado. Antes de qualquer uso real, cada limite precisa
  ser validado com o órgão responsável (Defesa Civil, Meio Ambiente, Trânsito).
- O motor de alertas da Sprint 5 lê só as regras ativas e precisa copiar operador, limite e
  gravidade para o alerta.
