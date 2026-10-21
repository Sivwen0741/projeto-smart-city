# Bairros de Ponta Grossa: distritos do IBGE e polígonos do OpenStreetMap

- **Data:** 20/10/2026
- **Item:** TT01, critério 3
- **Situação:** aceita

## Contexto

O critério 3 do TT01 (Sprint 4, seção 3.3) pede carga inicial com os bairros de Ponta Grossa
obtidos da API de Localidades do IBGE. A consulta feita em 20/10/2026 mostrou que a API não
desce abaixo do distrito:

| Consulta | Resultado |
|---|---|
| `/api/v1/localidades/municipios/4119905/distritos` | 5 distritos: Ponta Grossa (411990505), Guaragi (411990510), Itaiacoca (411990515), Piriquitos (411990517), Uvaia (411990525) |
| `/api/v1/localidades/municipios/4119905/subdistritos` | lista vazia |
| `/api/v1/localidades/municipios/4119905/bairros` | HTTP 404, o recurso não existe |

A API de Malhas do IBGE também não oferece recorte intramunicipal para município
(`intrarregiao` é recusado com HTTP 400).

O OpenStreetMap, via Overpass, tem os polígonos: 16 relações `boundary=administrative` com
`admin_level=10` (bairros) e 5 com `admin_level=9` (distritos). Quatro distritos trazem a tag
`IBGE:GEOCODIGO`; o distrito-sede não traz e é casado pelo nome.

## Alternativas consideradas

1. **Só IBGE.** Carregar os 5 distritos como se fossem bairros. Cumpre a letra do critério, mas
   o distrito-sede cobre a área urbana inteira e a consulta espacial perderia o sentido.
2. **Só OpenStreetMap.** Perde o código oficial do IBGE e a rastreabilidade com a fonte citada
   no documento da sprint.
3. **IBGE para distritos e OpenStreetMap para os polígonos** (escolhida).
4. **Buscar ao vivo na subida do ambiente.** O Overpass recusou requisição sem `User-Agent`
   (HTTP 406) e respondeu 502 durante a geração dos arquivos. A subida passaria a depender de
   serviço externo e do limite de requisições, risco registrado na seção 3.5 da Sprint 4.

## Decisão

- Distritos: lista e código da API de Localidades do IBGE; polígono do OpenStreetMap.
- Bairros: polígono e nome do OpenStreetMap; `codigo_ibge` do bairro fica nulo e o `osm_id`
  identifica a origem. O distrito de cada bairro é calculado na carga pelo ponto interno do
  polígono.
- Os dois GeoJSON são gerados uma vez por `api/scripts/atualizar-territorio.ts`
  (`npm run territorio:atualizar`), versionados em `api/src/database/seeds/territorio/` com a
  atribuição ODbL e carregados de forma idempotente a cada subida. O script não roda no
  `docker compose up`.
- **"Piriquitos 10" é incluído.** O OpenStreetMap traz 16 polígonos de bairro, um deles com esse
  nome, a noroeste da área urbana. A contagem de 15 bairros oficiais citada informalmente não foi
  confirmada em fonte. A carga existe para a consulta espacial resolver o bairro de um
  dispositivo; descartar o polígono só criaria uma área onde o bairro ficaria nulo.
- **Contorno da Chapada fechado com segmento reto.** Em 20/10/2026 a relação da Chapada no
  OpenStreetMap estava incompleta, com uma falha de cerca de 241 m no contorno, e o anel não
  fechava. O script fecha anéis abertos ligando a última ponta à primeira e avisa no console. A
  carga ainda aplica `ST_MakeValid` a toda geometria.
- Dispositivo fora de qualquer bairro (zona rural) fica com `bairro_id` nulo e distrito
  calculado; só é recusado o ponto fora do município.

## Consequências

- O modelo de dados ganha a tabela `distrito` e as colunas `bairro.distrito_id` e
  `bairro.osm_id` (ver `2026-10-20-ajustes-der-sprint-4.md`).
- Os arquivos versionados ficam sob a ODbL e mantêm a atribuição aos colaboradores do
  OpenStreetMap.
- Alteração de limite de bairro no OpenStreetMap só chega ao sistema quando alguém roda o
  script e versiona o resultado.
- `bairro.populacao_estimada` fica nula: nenhuma das duas fontes fornece população por bairro.
