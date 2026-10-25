# Ajustes no modelo de dados durante a Sprint 5

- **Data:** 24/10/2026, atualizado a cada item que muda o esquema
- **Item:** TT02, US02, US05
- **Situação:** aceita; o DER (`docs/diagrama-der.drawio` e `.png`) é regenerado no fim da sprint

## Contexto

Como na Sprint 4 (`2026-10-20-ajustes-der-sprint-4.md`), as mudanças de esquema entram por
migração versionada e ficam listadas aqui até o DER ser regenerado.

## Mudanças

| Mudança | Migração | Item | Motivo |
|---|---|---|---|
| `alerta.situacao` restrita a `aberto`, `em_atendimento` e `encerrado` | `1792454400003-IngestaoEAlertas` | TT02 | O motor de alertas e as telas dependem desses três valores |
| Índice único parcial `alerta_ativo_uq` em `(regra_alerta_id, dispositivo_id)` para os alertas ativos | `1792454400003-IngestaoEAlertas` | TT02-6 | Um alerta ativo por regra e dispositivo, mesmo com leituras simultâneas |
| Índice em `leitura (dispositivo_id, tipo_grandeza, data_hora)` | `1792454400003-IngestaoEAlertas` | TT02-4 | Contagem da duração mínima da regra |
| `alerta.data_encerramento timestamptz`, obrigatória se e só se a situação é `encerrado` | `1792454400004-EncerramentoDoAlerta` | US02-3 | "Encerrados hoje" e "já encerrados" da tela de alertas precisam do momento do encerramento |
| Índice em `alerta (data_hora)` | `1792454400004-EncerramentoDoAlerta` | US02-3 | Indicadores das últimas 24 h |
| `ocorrencia.endereco varchar(255)` | `1792454400005-OcorrenciaManual` | US05-1 | O formulário pede endereço, como o de dispositivo |
| `ocorrencia.origem` (`telefone` ou `alerta`) | `1792454400005-OcorrenciaManual` | US05-3, US05-5 | A ocorrência guarda de onde veio; o protótipo mostra "Origem: Alerta automático" |
| `ocorrencia.situacao` restrita a `aberta`, `em_atendimento` e `encerrada`; `ocorrencia.criticidade` às três gravidades | `1792454400005-OcorrenciaManual` | US05-3 | Mesmos valores que as telas usam |
| Sequência `ocorrencia_protocolo_seq` | `1792454400005-OcorrenciaManual` | US05-2 | Protocolo único no formato do protótipo |
| Índice em `alerta (ocorrencia_id)` | `1792454400005-OcorrenciaManual` | US05-5 | Alertas vinculados a uma ocorrência |

## Pendência

O registro da Sprint 4 previa o particionamento de `leitura` por período "na sprint de
ingestão". A TT02 não particionou a tabela: o volume da demonstração (10 dispositivos simulados,
cerca de 30 mil leituras por dia) não justifica a complexidade agora. O particionamento continua
previsto na modelagem e fica para quando houver volume real.

## Consequências

- O DER será regenerado no fim da Sprint 5 com estas colunas e restrições.
