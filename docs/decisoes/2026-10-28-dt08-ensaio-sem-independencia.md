# Ensaio em máquina limpa executado sem independência

- **Data:** 28/10/2026
- **Item:** TT01-5 e CT-005; débito técnico DT08, previsto para a próxima entrega
- **Situação:** aceita, com débito técnico DT08 aberto

## Contexto

O CT-005 exige que o projeto seja executado numa máquina limpa por um integrante que não escreveu
o manual de instalação, para que lacunas no README apareçam. Por indisponibilidade dos demais
integrantes no período de execução, o caso será executado pelo próprio autor do manual.

## Alternativas consideradas

1. **Esperar um integrante disponível.** Atrasa a execução de um caso de prioridade alta para
   depois do checkpoint 2.
2. **Executar com o autor e registrar o débito** (escolhida em 28/10/2026).

## Decisão

O CT-005 é executado pelo autor do README. O objetivo e a pré-condição do caso continuam
descrevendo a execução independente; a ficha registra que esta execução não atende a esse
requisito.

## DT08 - Ensaio em máquina limpa executado sem independência

**Critério de pronto:** um integrante que não escreveu o README executa o projeto numa máquina sem
Node e sem PostgreSQL seguindo só o manual, e as lacunas encontradas são corrigidas.

- **Responsável:** Bryan Charles
- **Previsto para:** próxima entrega

## Consequências

O resultado do CT-005 continua válido para verificar que o ambiente sobe pelo Compose numa máquina
sem Node e sem PostgreSQL, mas não verifica a suficiência do README para um leitor novo. Lacunas no
manual de instalação podem não ser detectadas (risco registrado na seção 1.2 do plano de teste).
