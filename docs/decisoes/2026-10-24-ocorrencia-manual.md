# Registro manual de ocorrência

- **Data:** 24/10/2026
- **Item:** US05, critérios 1 a 6 (`docs/sprint-5-criterios.md`)
- **Situação:** aceita; o formulário, as categorias e os órgãos foram aprovados pelo usuário em
  24/10/2026

## Contexto

O protótipo tem o botão "Registrar ocorrência" no menu e a tela de detalhe de uma ocorrência
(`04-ocorrencia.svg`), mas não o formulário de registro. O modelo de dados já tinha a tabela
`ocorrencia`, sem endereço, sem origem e sem regra para o protocolo. Não há cadastro de
categorias nem de órgãos no escopo.

## Alternativas consideradas

1. **Protocolo com sequência por mês** (zerando todo mês). Exige tabela de contadores e trava;
   o formato do protótipo não indica o recomeço.
2. **Ano e mês da abertura, mais uma sequência do banco que não reinicia** (escolhida):
   `2026-10-0001`, único mesmo com registros simultâneos.
3. **Categorias e órgãos digitados livremente.** Atrapalharia a estatística por categoria
   prevista no Documento de Visão (seção 7.4).

## Decisão

- `POST /api/ocorrencias` grava categoria, gravidade, órgão (opcional), descrição (opcional),
  ponto, endereço (opcional), bairro pela consulta espacial, usuário que registrou, situação
  `aberta`, origem e o primeiro registro de `historico_ocorrencia`. Também registra
  `registro_ocorrencia` no log de atividades e avisa as telas (`ocorrencia:nova`), e o mapa
  mostra a ocorrência na hora.
- Recusa sem categoria, sem gravidade ou sem ponto (400) e com ponto fora do município (422). O
  ponto na zona rural fica sem bairro, como na US22.
- Categorias fixas: Risco hidrológico, Alagamento, Trânsito e acidente, Iluminação pública,
  Qualidade do ar, Ruído, Infraestrutura urbana, Outra (`GET /api/ocorrencias/categorias`).
- Órgãos da carga inicial: Defesa Civil (DC), Mobilidade (MOB), Meio Ambiente (SMMA),
  Infraestrutura (INFRA), além do DTI, que é o "Tecnologia" do protótipo (`GET /api/orgaos`). As
  siglas foram escolhidas aqui, porque o protótipo só mostra os nomes.
- A partir de um alerta, com `alertaId`, a origem é `alerta` e o alerta fica vinculado. Um alerta
  já vinculado recebe 409 com o protocolo da ocorrência existente. A coluna "Órgão" da tela de
  alertas passa a mostrar o órgão dessa ocorrência.
- Na tela, o formulário abre sobre qualquer página pelo botão do menu, e pelo painel de
  reconhecimento ("Abrir ocorrência com este alerta"), já preenchido com a gravidade, a posição,
  o endereço e um resumo do alerta.

## Consequências

- A aba "Ocorrências" (lista e acompanhamento) continua desabilitada e passou a indicar a US06,
  sprint 6, em vez da US05.
- O detalhe da ocorrência de `04-ocorrencia.svg` e a atualização da situação são da US06.
