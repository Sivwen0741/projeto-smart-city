# Bairros dos dados de exemplo pela camada oficial

- **Data:** 22/10/2026
- **Item:** US22; TT01, critério 3
- **Situação:** aceita

## Contexto

O protótipo (`design/02-painel.svg`, `design/05-dispositivos.svg`) localiza o sensor SN-014 em
"Vila Isabel". Ao carregar os dados de exemplo, esse nome não existe entre os bairros da base
territorial. A camada de bairros vem do OpenStreetMap (`admin_level=10`), conforme
`2026-10-20-bairros-ibge-osm.md`, e tem 16 polígonos: Boa Vista, Cará-Cará, Centro, Chapada,
Colônia Dona Luiza, Contorno, Estrela, Jardim Carvalho, Neves, Nova Rússia, Oficinas, Olarias,
Piriquitos 10, Ronda, Uvaranas e Órfãs.

Vila Isabel é o nome de uma localidade dentro de um desses bairros, não de um bairro oficial.

## Alternativas consideradas

1. **Cadastrar Vila Isabel como bairro.** Criaria um polígono sem fonte e quebraria a regra de
   que o bairro sai de consulta espacial sobre a área oficial (US22-3).
2. **Alterar o protótipo.** O protótipo é artefato aprovado da equipe e documenta a intenção da
   tela, não a base territorial.
3. **Manter o protótipo e usar nos dados do sistema só bairros da camada oficial** (escolhida).

## Decisão

O protótipo não é alterado. Os dados de exemplo
(`api/src/database/seeds/dispositivos-exemplo.seed.ts`), os testes e os exemplos do Swagger usam
apenas bairros que existem na camada oficial. O SN-014 do protótipo fica em Olarias, bairro do
Arroio Olarias, onde o protótipo o descreve.

## Consequências

- Quem comparar a tela com o protótipo vai ver "Olarias" no lugar de "Vila Isabel". A diferença
  é intencional e está registrada aqui.
- Nomes de localidade que não são bairro podem ir para o campo endereço ou descrição do
  dispositivo, e nunca para o bairro.
