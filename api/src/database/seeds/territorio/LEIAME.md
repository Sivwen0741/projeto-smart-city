# Base territorial de Ponta Grossa

Arquivos gerados por `npm run territorio:atualizar` (`api/scripts/atualizar-territorio.ts`) e
carregados no banco a cada subida da interface de programação. Decisão registrada em
`docs/decisoes/2026-10-20-bairros-ibge-osm.md`.

| Arquivo | Conteúdo | Origem |
|---|---|---|
| `distritos.geojson` | 5 distritos, com código IBGE | Lista e códigos: IBGE, API de Localidades. Polígonos: OpenStreetMap (`admin_level=9`) |
| `bairros.geojson` | 16 polígonos de bairro | OpenStreetMap (`admin_level=10`) |

Na geração de 20/10/2026, o contorno da Chapada veio aberto do OpenStreetMap (falha de cerca de
241 m) e foi fechado com segmento reto pelo script.

## Atribuição e licença

Os polígonos são © colaboradores do OpenStreetMap, disponíveis sob a
[Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Veja <https://www.openstreetmap.org/copyright>. Estes arquivos são uma base de dados derivada
e permanecem sob a ODbL.

Os dados de localidades do IBGE são públicos e de livre utilização, com citação da fonte:
Instituto Brasileiro de Geografia e Estatística, API de Localidades
(<https://servicodados.ibge.gov.br/api/docs/localidades>).
