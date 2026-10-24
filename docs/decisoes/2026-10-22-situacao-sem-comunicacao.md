# Limite de "Sem comunicação" por intervalo de leitura

- **Data:** 22/10/2026
- **Item:** US22, critério 6
- **Situação:** aceita

## Contexto

A listagem de dispositivos (`design/05-dispositivos.svg`) mostra a situação de cada equipamento.
Conforme `2026-10-20-ajustes-der-sprint-4.md`, a situação exibida não é digitada: o cadastro
guarda o estado administrativo (`ativo`, `manutencao`, `inativo`) e a situação é calculada. Para
virar teste, o momento em que um dispositivo passa a ficar "Sem comunicação" precisava de uma
regra escrita.

Equipamentos diferentes se comunicam em ritmos diferentes. Só o sensor urbano tem intervalo de
leitura próprio no diagrama de classes (`intervaloLeituraSegundos`); câmera, semáforo e estação
ambiental não têm.

## Alternativas consideradas

1. **Limite fixo de 30 minutos para todos.** Simples, mas marca tarde demais um sensor que lê a
   cada 30 segundos e não diz de onde veio o número.
2. **Duas vezes o intervalo do dispositivo e 30 minutos para os demais.** Deixa câmeras,
   semáforos e estações com um número arbitrário.
3. **Duas vezes o intervalo esperado, do dispositivo ou do tipo** (escolhida).

## Decisão

`tipo_dispositivo` ganha a coluna `intervalo_leitura_segundos`, preenchida na carga inicial. O
dispositivo pode sobrescrever esse valor com o atributo próprio `intervaloLeituraSegundos`. O
limite é:

```sql
COALESCE(2 * COALESCE(dispositivo.intervaloLeituraSegundos, tipo.intervalo_leitura_segundos), 1800)
```

A situação calculada segue esta ordem:

| Situação | Condição |
|---|---|
| Inativo | `estado = 'inativo'` |
| Em manutenção | `estado = 'manutencao'` |
| Sem comunicação | nunca se comunicou, ou a última comunicação é mais antiga que o limite |
| Operando | demais casos |

A carga inicial usa 30 s para todos os tipos instrumentados. A fonte é o guia de identidade
(`design/00-identidade.svg`: "o sensor atualiza a cada trinta segundos") e o painel do
protótipo de dispositivos, que mostra "Intervalo de leitura 30 s". O controlador de iluminação
ficou sem intervalo até o DT01 e caía nos 30 minutos. Com o DT01, resolvido em 24/10/2026, ele também
usa 30 s.

"Alerta ativo", que o protótipo também mostra na coluna, depende do motor de alertas e entra na
Sprint 5.

## Consequências

- Uma regra só, verificada pelo teste
  `US22-6 sem comunicação passa de duas vezes o intervalo do dispositivo, do tipo ou, sem nenhum, de 30 minutos`,
  que cobre os três níveis do `COALESCE`.
- O resumo do cabeçalho passa a dizer "N sem comunicação", sem o "há mais de 30 min" do
  protótipo, que deixou de ser verdadeiro para todos os tipos.
- A API devolve `limiteComunicacaoSegundos` em cada dispositivo. O alerta de perda de comunicação
  (US07, Sprint 6) pode usar o mesmo limite.
- Nova coluna no DER: `tipo_dispositivo.intervalo_leitura_segundos`, incluída na regeneração do
  diagrama prevista para o fim da sprint.
