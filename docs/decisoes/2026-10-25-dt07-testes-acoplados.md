# Suítes de teste acopladas pela ordem de execução

- **Data:** 25/10/2026
- **Item:** US09 e US10; débito técnico DT07, previsto para a Sprint 7
- **Situação:** aceita, com débito técnico DT07 aberto

## Contexto

Os testes e2e rodam em sequência num único banco de teste, que é reaproveitado entre rodadas. A
suíte da US09 simula a Flood API e grava vazão e previsão para todos os sensores de nível do banco,
inclusive os criados por outras suítes. A suíte da US10 precisa controlar a vazão de cada caso e,
por isso, apaga no início todas as vazões do Open-Meteo (`previsao` e leituras com
`fonte_dados_id`). O resultado de uma suíte depende do que outra deixou, ou deixou de deixar, no
banco.

## Alternativas consideradas

1. **Refatorar agora para cada suíte usar só os próprios dados.** Correto, mas tira tempo da
   entrega de 30/10/2026.
2. **Manter a limpeza e registrar o débito** (escolhida, por decisão do autor em 25/10/2026).

## Decisão

A limpeza na suíte da US10 fica como está até a Sprint 7.

## DT07 - Isolar os dados de cada suíte de teste

**Critério de pronto:** cada suíte cria e limpa os próprios dados sem tocar nos de outra, e a
suíte completa passa em qualquer ordem de execução e com o banco de teste reaproveitado.

Pontos conhecidos:

- a coleta do Open-Meteo na US09 grava para todos os sensores de nível, não só para os da suíte;
- a US10 apaga todas as vazões do Open-Meteo do banco;
- a US06 encerra todas as ocorrências em andamento para testar a ordem da lista;
- a US07 dispara a verificação de comunicação para todos os dispositivos do banco.

## Consequências

Falha intermitente em qualquer teste que envolva vazão, ocorrências ou alertas de sem comunicação
tem esta causa como primeira suspeita.
