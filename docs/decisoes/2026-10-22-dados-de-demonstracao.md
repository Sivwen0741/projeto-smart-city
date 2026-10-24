# Dispositivos de exemplo e última comunicação como dados de demonstração

- **Data:** 22/10/2026
- **Item:** US22, critério 6
- **Situação:** aceita

## Contexto

A carga inicial traz 13 dispositivos de exemplo (`api/src/database/seeds/dispositivos-exemplo.seed.ts`),
para que a tela de dispositivos não abra vazia e mostre as quatro situações: operando, sem
comunicação, em manutenção e inativo.

Pela regra de `2026-10-22-situacao-sem-comunicacao.md`, um dispositivo com intervalo de 30 s
fica sem comunicação 60 s depois da última comunicação. Na Sprint 4 nada atualiza
`dispositivo.ultima_comunicacao`, porque a ingestão de leituras por MQTT é objetivo da Sprint 5 e
não está entre os itens comprometidos (seção 3.2 do replanejamento). Gravados uma vez só, os
exemplos ficariam todos sem comunicação depois do primeiro minuto da primeira subida.

## Alternativas consideradas

1. **Gravar a última comunicação só na primeira carga.** Depois de qualquer reinício, a tela
   abre com quase tudo sem comunicação.
2. **Publicar sinais de vida dos exemplos pelo Mosquitto e gravá-los num assinante.** Funciona
   de forma contínua, mas é a camada de ingestão, fora do escopo da Sprint 4.
3. **Renovar a última comunicação dos exemplos ativos a cada subida** (escolhida).

## Decisão

- Os dispositivos de exemplo e a última comunicação deles são **dados de demonstração**, não
  medições.
- A cada subida, a carga inicial grava de novo a última comunicação dos exemplos com estado
  `ativo`, com o mesmo atraso definido para cada um. O SN-014 volta a "há 8 s", o EA-07 continua
  a "há 39 min" e o SN-027 continua sem nunca ter se comunicado. Exemplos em manutenção ou
  inativos, inclusive os que alguém inativar pela tela, não são tocados.
- Os exemplos são reconhecidos pelo código identificador. Os demais campos editados pela tela
  são preservados; só a última comunicação é renovada.

## Consequências

- Logo depois da subida, a tela mostra 9 dispositivos operando, 2 sem comunicação, 1 em
  manutenção e 1 inativo. Depois de cerca de um minuto, os operando passam para sem
  comunicação. Isso demonstra a regra funcionando e é o comportamento correto enquanto não
  houver ingestão.
- A atualização real da última comunicação depende da ingestão da Sprint 5. Quando ela
  existir, esta renovação deve ser retirada da carga inicial.
- Um dispositivo real cadastrado com o código de um exemplo (por exemplo, SN-014) teria a última
  comunicação renovada a cada subida. Enquanto existirem dados de demonstração, esses códigos
  ficam reservados.
- O teste `US22-6 a cada subida os exemplos ativos voltam a ter comunicação recente...` verifica
  a renovação.
