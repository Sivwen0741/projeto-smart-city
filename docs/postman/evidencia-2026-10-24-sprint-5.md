# Validação das rotas das Sprints 4 e 5 com a coleção do Postman

- **Data:** 24/10/2026
- **Ambiente:** clone limpo da `main` (commit `9433ef5`, depois do merge da US05), subido com
  `docker compose -p ensaio-main5 up --build` em portas próprias, com banco novo e o simulador
  ligado. A coleção rodou depois do primeiro alerta do simulador (chuva forte no EA-02), para o
  reconhecimento ser exercitado num alerta real.
- **Coleção:** [`scoc.postman_collection.json`](scoc.postman_collection.json), que acumula as rotas
  das Sprints 4 e 5: 38 requisições e 70 verificações. A coleção só da Sprint 4 continua em
  [`scoc-sprint-4.postman_collection.json`](scoc-sprint-4.postman_collection.json), como evidência
  daquela validação.
- **Como foi executada:** pelo Newman 6.2.3, o executor de linha de comando do Postman, pelo
  próprio autor do código. **A coleção não foi aberta no aplicativo Postman.**
- **Resultado:** 38 requisições e 70 verificações, nenhuma falha.

```sh
npx newman run docs/postman/scoc.postman_collection.json --env-var "senha=<ADMIN_SENHA>"
```

## Saída da execução

```text
newman

SCOC - Sprints 4 e 5

❏ Saúde e autenticação (TT01, US20)
↳ GET /api/health sem token
  GET http://localhost:3100/api/health [200 OK, 270B, 25ms]
  ✓  responde 200

↳ POST /api/auth/login sem senha
  POST http://localhost:3100/api/auth/login [400 Bad Request, 397B, 36ms]
  ✓  responde 400

↳ POST /api/auth/login com senha errada
  POST http://localhost:3100/api/auth/login [401 Unauthorized, 326B, 85ms]
  ✓  responde 401
  ✓  mensagem genérica

↳ POST /api/auth/login com e-mail inexistente
  POST http://localhost:3100/api/auth/login [401 Unauthorized, 326B, 43ms]
  ✓  responde 401
  ✓  mesma mensagem do e-mail existente

↳ POST /api/auth/login
  POST http://localhost:3100/api/auth/login [200 OK, 549B, 54ms]
  ✓  responde 200
  ✓  devolve token e usuário sem hash
  ┌
  │ `Using "atob" is deprecated. Use "require('atob')" ins
  │ tead.`
  └
  ✓  token vale oito horas

↳ GET /api/auth/eu
  GET http://localhost:3100/api/auth/eu [200 OK, 346B, 20ms]
  ✓  responde 200
  ✓  devolve o usuário autenticado

↳ GET /api/dispositivos sem token
  GET http://localhost:3100/api/dispositivos [401 Unauthorized, 347B, 2ms]
  ✓  responde 401

❏ Dispositivos (US22)
↳ GET /api/grandezas
  GET http://localhost:3100/api/grandezas [200 OK, 1.12kB, 10ms]
  ✓  responde 200
  ✓  lista grandezas

↳ GET /api/tipos-dispositivo
  GET http://localhost:3100/api/tipos-dispositivo [200 OK, 3.07kB, 15ms]
  ✓  responde 200
  ✓  traz o sensor de nível com os campos próprios

↳ GET /api/territorio/localizar
  GET http://localhost:3100/api/territorio/localizar?latitude=-25.09514&longitude=-50.16187 [200 OK, 295B, 31ms]
  ✓  responde 200
  ✓  bairro e distrito pela coordenada

↳ GET /api/territorio/localizar fora do município
  GET http://localhost:3100/api/territorio/localizar?latitude=-23.55&longitude=-46.63 [422 Unprocessable Entity, 370B, 11ms]
  ✓  responde 422

↳ GET /api/dispositivos ordenado por situação
  GET http://localhost:3100/api/dispositivos?ordem=situacao&direcao=desc [200 OK, 8.21kB, 57ms]
  ✓  responde 200
  ✓  cada item traz as colunas da listagem

↳ GET /api/dispositivos com ordenação inválida
  GET http://localhost:3100/api/dispositivos?ordem=xyz [400 Bad Request, 321B, 8ms]
  ✓  responde 400

↳ POST /api/dispositivos
  POST http://localhost:3100/api/dispositivos [201 Created, 800B, 35ms]
  ✓  responde 201
  ✓  bairro calculado pela coordenada
  ✓  atributos do tipo gravados

↳ POST /api/dispositivos com código repetido
  POST http://localhost:3100/api/dispositivos [409 Conflict, 385B, 14ms]
  ✓  responde 409
  ✓  mensagem cita o código

↳ GET /api/dispositivos/{id}
  GET http://localhost:3100/api/dispositivos/14 [200 OK, 795B, 14ms]
  ✓  responde 200
  ✓  é o dispositivo cadastrado

↳ PATCH /api/dispositivos/{id} inativa
  PATCH http://localhost:3100/api/dispositivos/14 [200 OK, 789B, 35ms]
  ✓  responde 200
  ✓  fica inativo, sem excluir

↳ GET /api/dispositivos/{id}/leituras após inativar
  GET http://localhost:3100/api/dispositivos/14/leituras [200 OK, 235B, 16ms]
  ✓  responde 200
  ✓  histórico continua acessível

↳ GET /api/dispositivos/{id} inexistente
  GET http://localhost:3100/api/dispositivos/999999999 [404 Not Found, 321B, 13ms]
  ✓  responde 404

❏ Regras de alerta (US23)
↳ GET /api/regras-alerta
  GET http://localhost:3100/api/regras-alerta [200 OK, 1.48kB, 15ms]
  ✓  responde 200
  ✓  lista as regras

↳ POST /api/regras-alerta
  POST http://localhost:3100/api/regras-alerta [201 Created, 423B, 19ms]
  ✓  responde 201
  ✓  devolve os campos da regra

↳ POST /api/regras-alerta sem limite, sem operador e com duração negativa
  POST http://localhost:3100/api/regras-alerta [400 Bad Request, 407B, 8ms]
  ✓  responde 400
  ✓  mensagem para cada caso

↳ GET /api/regras-alerta/{id}
  GET http://localhost:3100/api/regras-alerta/8 [200 OK, 418B, 10ms]
  ✓  responde 200

↳ PATCH /api/regras-alerta/{id} altera o limite
  PATCH http://localhost:3100/api/regras-alerta/8 [200 OK, 418B, 16ms]
  ✓  responde 200
  ✓  novo limite gravado

↳ PATCH /api/regras-alerta/{id} desativa
  PATCH http://localhost:3100/api/regras-alerta/8 [200 OK, 419B, 15ms]
  ✓  responde 200
  ✓  desativada, sem excluir

↳ GET /api/regras-alerta/{id}/alteracoes
  GET http://localhost:3100/api/regras-alerta/8/alteracoes [200 OK, 808B, 20ms]
  ✓  responde 200
  ✓  registra o limite anterior e o novo, com autor

❏ Sprint 5: mapa, alertas e ocorrências (US01 a US05, US28)
↳ GET /api/territorio/bairros
  GET http://localhost:3100/api/territorio/bairros [200 OK, 52.46kB, 149ms]
  ✓  responde 200
  ✓  contornos dos bairros em GeoJSON

↳ GET /api/ocorrencias/categorias
  GET http://localhost:3100/api/ocorrencias/categorias [200 OK, 377B, 8ms]
  ✓  responde 200
  ✓  lista de categorias

↳ GET /api/orgaos
  GET http://localhost:3100/api/orgaos [200 OK, 506B, 10ms]
  ✓  responde 200
  ✓  traz a Defesa Civil

↳ POST /api/ocorrencias sem categoria
  POST http://localhost:3100/api/ocorrencias [400 Bad Request, 319B, 8ms]
  ✓  responde 400
  ✓  pede a categoria

↳ POST /api/ocorrencias
  POST http://localhost:3100/api/ocorrencias [201 Created, 617B, 31ms]
  ✓  responde 201
  ✓  protocolo no formato ano-mês-sequência
  ✓  origem telefone, situação aberta e bairro calculado

↳ GET /api/ocorrencias
  GET http://localhost:3100/api/ocorrencias [200 OK, 614B, 14ms]
  ✓  responde 200
  ✓  lista as abertas com coordenada

↳ GET /api/alertas/resumo
  GET http://localhost:3100/api/alertas/resumo [200 OK, 1.1kB, 56ms]
  ✓  responde 200
  ✓  indicadores da tela de alertas

↳ GET /api/alertas
  GET http://localhost:3100/api/alertas?visao=ativos [200 OK, 793B, 26ms]
  ✓  responde 200
  ✓  ordenados por gravidade

↳ GET /api/alertas com visão inválida
  GET http://localhost:3100/api/alertas?visao=todos [400 Bad Request, 358B, 7ms]
  ✓  responde 400

↳ POST /api/alertas/{id}/reconhecimento sem providência
  POST http://localhost:3100/api/alertas/1/reconhecimento [400 Bad Request, 330B, 13ms]
  ✓  responde 400

↳ POST /api/alertas/{id}/reconhecimento
  POST http://localhost:3100/api/alertas/1/reconhecimento [200 OK, 853B, 48ms]
  ✓  responde 200
  ✓  passa a em atendimento

↳ POST /api/alertas/{id}/reconhecimento de novo
  POST http://localhost:3100/api/alertas/1/reconhecimento [409 Conflict, 1.02kB, 28ms]
  ✓  responde 409
  ✓  diz quem reconheceu

┌─────────────────────────┬───────────────────┬──────────────────┐
│                         │          executed │           failed │
├─────────────────────────┼───────────────────┼──────────────────┤
│              iterations │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│                requests │                38 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│            test-scripts │                38 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│      prerequest-scripts │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│              assertions │                70 │                0 │
├─────────────────────────┴───────────────────┴──────────────────┤
│ total run duration: 1566ms                                     │
├────────────────────────────────────────────────────────────────┤
│ total data received: 73.87kB (approx)                          │
├────────────────────────────────────────────────────────────────┤
│ average response time: 26ms [min: 2ms, max: 149ms, s.d.: 26ms] │
└────────────────────────────────────────────────────────────────┘
```
