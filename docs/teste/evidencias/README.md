# Evidências da execução dos testes

Evidências da seção 3 (log de execução) da documentação de teste da Sprint 6, no formato da seção
"Formato dos registros da execução" do plano de teste. O log por caso está em
[`../log-de-execucao.md`](../log-de-execucao.md) e os incidentes em
[`../incidentes.md`](../incidentes.md).

**Uma pasta por rodada:** `AAAA-MM-DD-rodada-N/`, por exemplo `2026-11-02-rodada-1/`. Dentro dela:

- **Saída da suíte automatizada:** `unidade.txt` e `integracao.txt`, mais `smoke.txt` com o smoke
  test que abre a rodada. Cada arquivo começa com a data, a hora, a versão e o comando usado.
- **Saída do Newman:** `newman.txt`.
- **Captura de tela de caso manual:** uma por caso, nomeada pelo identificador do caso
  (`CT-034.png`). Quando o caso precisa de mais de uma captura, numere na ordem dos passos:
  `CT-049-1.png`, `CT-049-2.png` e assim por diante.

**Reteste de incidente:** pasta própria, `AAAA-MM-DD-reteste-INC-NNN/`, com a versão corrigida
identificada pelo commit.
