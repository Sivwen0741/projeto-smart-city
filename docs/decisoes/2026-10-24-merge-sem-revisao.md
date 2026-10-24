# Merge da Sprint 4 na main sem a revisão de outro integrante

- **Data:** 24/10/2026
- **Item:** TT01, US20, US22 e US23; Definition of Done (seção 3.4); critério TT01-5; ação AM04
- **Situação:** aceita, com débito técnico DT06 aberto para a Sprint 5

## Contexto

Os quatro itens da Sprint 4 ficaram prontos em 22/10/2026, em PRs empilhados (#2, #4, #5 e #6),
aguardando a revisão de outro integrante. A Definition of Done exige que o código esteja na
`main` com revisão de pelo menos um integrante além do autor. A revisão não aconteceu até
24/10/2026, e a entrega funcional é em 30/10/2026.

Sem o código na `main`, o README precisava mandar trocar para a branch `sprint-4-us23`, e a
avaliação da sprint dependia de uma branch de trabalho.

## Alternativas consideradas

1. **Esperar a revisão antes do merge.** Cumpre a Definition of Done, mas deixa a `main` sem
   código e a entrega dependente de uma revisão sem data.
2. **Mesclar sem revisão e registrar o descumprimento** (escolhida).
3. **Mesclar sem revisão e marcar os itens como concluídos.** Descartada: a verificação seria
   declarada por quem escreveu o código, contra a própria Definition of Done.

## Decisão

Os PRs foram mesclados na `main` em 24/10/2026, na ordem da pilha, com merge commit, para que
cada item continue identificável no histórico. Nenhum critério foi marcado como verificado por
outra pessoa. A falta de revisão, o TT01-5 e a AM04 ficam registrados como pendências em
[`verificacao-sprint-4.md`](../verificacao-sprint-4.md) e são o débito técnico DT06.

## DT06 - Cumprir a revisão cruzada e a verificação em máquina limpa da Sprint 4

- **Sprint prevista:** Sprint 5
- **Origem:** Definition of Done da Sprint 4 (seção 3.4 de
  [`Sprint_4_Replanejamento.pdf`](../Sprint_4_Replanejamento.pdf)), 1º item: "O código está na
  branch principal, com revisão de pelo menos um integrante além do autor"; e critério de aceite
  TT01-5: "O manual de instalação no README permite que outro integrante execute o projeto em
  uma máquina limpa, verificado por alguém que não escreveu o manual".
- **O que falta:**
  1. Revisão do código da TT01, US20, US22 e US23, já na `main`, por um integrante além do
     autor, com os apontamentos corrigidos em PR próprio.
  2. Execução do projeto em máquina limpa, seguindo só o README, por alguém que não escreveu
     o manual.
- **Relacionado:** a ação AM04 (distribuir o desenvolvimento) também não foi cumprida na
  Sprint 4. Todos os commits da sprint são de um integrante só, e os testes automatizados não
  têm autoria do responsável por qualidade.

## Consequências

- A `main` tem o código da Sprint 4 e o README não depende mais de outra branch.
- Nenhum item da Sprint 4 cumpre a Definition of Done até o DT06 ser concluído, e a revisão da
  sprint precisa tratar isso como pendência, não como item concluído.
- Os apontamentos da revisão, quando vierem, entram como correções sobre a `main`, e não mais
  antes do merge.
