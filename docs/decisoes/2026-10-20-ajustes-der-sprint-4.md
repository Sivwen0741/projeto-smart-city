# Ajustes no modelo de dados para os critérios da Sprint 4

- **Data:** 20/10/2026
- **Itens:** TT01, US20, US22, US23
- **Situação:** aceita

## Contexto

A migração inicial cria o esquema do diagrama entidade-relacionamento
(`docs/diagrama-der.drawio`). Ao confrontar o DER com os critérios de aceite da seção 3.3 da
Sprint 4, cinco critérios não tinham onde ser gravados.

## Decisão

| Ajuste | Critério | Motivo |
|---|---|---|
| `dispositivo.endereco varchar` | US22-1 | O formulário pede endereço e o DER não tinha a coluna |
| `dispositivo.estado` restrito a `ativo`, `manutencao` e `inativo` | US22-1, US22-5 | A situação cadastrada é administrativa. "Operando", "Alerta ativo" e "Sem comunicação" que o protótipo mostra são calculados a partir de `ultima_comunicacao` e dos alertas, não digitados |
| `log_atividade.usuario_id` aceita nulo | US20-7 | Tentativa de acesso com e-mail inexistente também gera registro |
| `log_atividade.entidade_id bigint` e `log_atividade.detalhes jsonb` | US20-7, US22-7, US23-6 | Identificar o registro afetado e guardar resultado da tentativa e valor anterior e novo |
| `alerta.operador` e `alerta.valor_limite`, copiados da regra no disparo | US23-4 | Editar a regra não pode alterar o que um alerta já emitido mostra. A tela de alertas exibe "3,81 m · limite 3,50 m" |
| Tabela `distrito` (nome, `codigo_ibge`, `area geometry`) e `bairro.distrito_id`, `bairro.osm_id` | TT01-3 | Ver `2026-10-20-bairros-ibge-osm.md` |

Detalhes de implementação, sem mudança de significado em relação ao DER:

- Chaves `bigint` geradas por `GENERATED ALWAYS AS IDENTITY`.
- Colunas `timestamp` do DER implementadas como `timestamptz`.
- Geometrias com SRID 4326: `geography(Point)` para dispositivo e ocorrência,
  `geometry(MultiPolygon)` para bairro e distrito, com índice GIST.
- Unicidade sem diferença de maiúsculas em `usuario.email` e `dispositivo.identificador`.
- O particionamento de `leitura` por período, previsto na modelagem, fica para a sprint de
  ingestão. Nesta sprint existe só o índice sobre `(dispositivo_id, data_hora)`.

## Consequências

O DER em `.drawio` e `.png` é regenerado com estas tabelas e colunas antes do fim da Sprint 4,
conforme a Definition of Done.
