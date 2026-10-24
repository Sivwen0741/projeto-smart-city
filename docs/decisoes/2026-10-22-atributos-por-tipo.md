# Atributos próprios de cada tipo de dispositivo

- **Data:** 22/10/2026
- **Item:** US22, critérios 1 e 4; DT01
- **Situação:** aceita; o controlador de iluminação deixou de ser provisório com o DT01, em
  [`2026-10-24-dt01-controlador-iluminacao.md`](2026-10-24-dt01-controlador-iluminacao.md)

## Contexto

O modelo de dados resolve a hierarquia de dispositivos por tabela única: os campos comuns ficam
em `dispositivo` e os próprios de cada especialização em `atributos_especificos jsonb`
(`docs/Modelagem_Estrutural_e_de_Dados.pdf`, seção do modelo físico). O formulário da US22
precisa saber quais campos mostrar para cada tipo, e a API precisa recusar o que não pertence
ao tipo.

O Documento de Visão (seção 7.1) define o escopo do cadastro: sensores urbanos, câmeras de
monitoramento, semáforos inteligentes e estações ambientais. O protótipo também mostra o
controlador de iluminação, que não está no diagrama de classes. Alinhar esse tipo entre os
artefatos é o DT01 desta sprint.

## Alternativas consideradas

1. **Campos livres no `jsonb`, sem validação.** O banco aceitaria qualquer coisa e o formulário
   não teria de onde tirar os campos.
2. **Uma tabela por especialização.** Contraria a estratégia de tabela única do modelo.
3. **Definição dos campos por categoria na API, validada no cadastro e servida ao formulário**
   (escolhida).

## Decisão

Cada tipo cadastrado em `tipo_dispositivo` tem uma `categoria`, que é a especialização do
diagrama de classes. Os campos por categoria são:

| Categoria | Atributos | Fonte |
|---|---|---|
| `sensor_urbano` | `tipoGrandeza` (obrigatório), `unidadeMedida`, `intervaloLeituraSegundos` | SensorUrbano |
| `camera_monitoramento` | `modelo`, `resolucao`, `anguloVisao` (1 a 360) | CameraMonitoramento |
| `semaforo_inteligente` | `tempoCicloSegundos`, `modoOperacao` | SemaforoInteligente |
| `estacao_ambiental` | `fabricante`, `variaveisMonitoradas` (lista de grandezas) | EstacaoAmbiental |
| `controlador_iluminacao` | `quantidadePontos` (obrigatório), `intervaloLeituraSegundos` | ControladorIluminacao, desde o DT01 |

Os tipos da carga inicial seguem os nomes do protótipo: Sensor de nível, Sensor de tráfego e
Sensor de ruído (sensor urbano), Câmera, Semáforo inteligente, Estação ambiental e Controlador
de iluminação.

As grandezas aceitas em `tipoGrandeza` e `variaveisMonitoradas` são as variáveis da seção 7.2
do Documento de Visão. A lista fica em `api/src/grandezas.ts` e será usada também pela regra de
alerta (US23).

A definição fica em `api/src/dispositivos/atributos.ts`. `GET /api/tipos-dispositivo` devolve os
campos de cada tipo, e o formulário monta os campos a partir dessa resposta. O cadastro recusa
com 400 um atributo de outro tipo, um valor fora da faixa ou um obrigatório ausente.

## Consequências

- O vídeo das câmeras fica fora do escopo (Documento de Visão, seção 8). Por isso a câmera só
  guarda metadados.
- Com o DT01 concluído, só a entrada `controlador_iluminacao` mudou, sem migração, porque os
  atributos ficam no `jsonb`. A marca `provisoria` e o aviso do formulário saíram junto.
- Trocar o tipo de um dispositivo exige atributos compatíveis com o novo tipo.
