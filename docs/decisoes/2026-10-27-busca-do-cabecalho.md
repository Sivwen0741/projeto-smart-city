# Busca do cabeçalho

- **Data:** 27/10/2026
- **Item:** US26, critérios 1 a 3 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

A caixa "Buscar ocorrência" do cabeçalho de `02-painel.svg` estava desabilitada com a marca da
US26. A prancheta da Sprint 6 (`2026-10-25-prancheta-sprint-6.md`) aprovou a forma: lista sob a
caixa, a partir do terceiro caractere, com ocorrências e dispositivos, sem diferenciar acentos e com
navegação pelo teclado. O protótipo também tem caixas de busca dentro das telas de alertas,
ocorrências e dispositivos, que traziam a mesma marca.

## Alternativas consideradas

1. **Comparar sem acento no navegador, com a lista inteira carregada.** Não escala para o
   histórico de ocorrências.
2. **Função de normalização escrita à mão no SQL (`translate`).** Repete o que a extensão `unaccent`
   do PostgreSQL já faz.
3. **`GET /api/busca` com `unaccent` e `ILIKE`** (escolhida).

## Decisão

- `GET /api/busca?q=` exige três caracteres depois de tirar os espaços das pontas e devolve
  `{ ocorrencias, dispositivos }`, até oito de cada. Ocorrências casam por protocolo, endereço ou
  bairro, em andamento primeiro e depois da mais recente; dispositivos casam por código, endereço,
  bairro ou, fora de bairro, distrito, em ordem de código. `%` e `_` contam como texto.
- A migração `BuscaSemAcento` liga a extensão `unaccent`, que vem com a imagem do PostGIS.
- Na tela, a caixa consulta 250 ms depois da última tecla. Setas percorrem os resultados, Enter
  abre, Esc fecha. A ocorrência abre em `/ocorrencias/:id`; o dispositivo, em `/dispositivos?id=`,
  que abre o painel de edição já existente.
- As caixas de busca das telas de alertas, ocorrências e dispositivos filtram a lista da própria
  tela, o que é a US08 (filtros, backlog), e não a busca geral da US26. Continuam desabilitadas e
  passam a ter a marca da US08.

## Consequências

- Sem índice para a busca: com o volume da demonstração, a varredura é imediata. Um índice de
  trigramas sobre `unaccent` fica para quando o histórico crescer.
- O limite de oito por grupo não mostra "ver todos"; quem precisa de mais refina o texto.
