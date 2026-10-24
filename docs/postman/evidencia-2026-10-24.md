# Validação das rotas da Sprint 4 com a coleção do Postman

- **Data:** 24/10/2026
- **Ambiente:** clone limpo da `main` (commit `06f36f1`), `docker compose up --build` seguindo o
  README, macOS com Docker Desktop. Banco criado do zero nesta subida.
- **Coleção:** [`scoc-sprint-4.postman_collection.json`](scoc-sprint-4.postman_collection.json),
  com as 16 rotas documentadas no Swagger, em 26 requisições e 47 verificações, incluindo os casos
  de recusa (sem token, credencial inválida, código repetido, regra inválida, recurso inexistente).
- **Como foi executada:** pelo Newman 6.2.3, o executor de linha de comando do Postman, que roda a
  mesma coleção e os mesmos scripts de teste do aplicativo. **A coleção não foi aberta no
  aplicativo Postman** nesta validação, e a execução foi feita pelo próprio autor do código.
- **Resultado:** 26 requisições e 47 verificações, nenhuma falha.

Para repetir no aplicativo, importe a coleção, preencha a variável `senha` com a `ADMIN_SENHA`
do `.env` e use **Run collection**. Pela linha de comando:

```sh
npx newman run docs/postman/scoc-sprint-4.postman_collection.json --env-var "senha=<ADMIN_SENHA>"
```

A requisição de login guarda o token na variável `token`, usada pelas demais. Cada execução
cadastra um dispositivo e uma regra com código novo (`PM-...`), inativa o dispositivo e desativa
a regra, então pode ser repetida no mesmo banco.

## Saída da execução

```text
newman

SCOC - Sprint 4

❏ Saúde e autenticação (TT01, US20)
↳ GET /api/health sem token
  GET http://localhost:3000/api/health [200 OK, 270B, 23ms]
  ✓  responde 200

↳ POST /api/auth/login sem senha
  POST http://localhost:3000/api/auth/login [400 Bad Request, 397B, 7ms]
  ✓  responde 400

↳ POST /api/auth/login com senha errada
  POST http://localhost:3000/api/auth/login [401 Unauthorized, 326B, 68ms]
  ✓  responde 401
  ✓  mensagem genérica

↳ POST /api/auth/login com e-mail inexistente
  POST http://localhost:3000/api/auth/login [401 Unauthorized, 326B, 43ms]
  ✓  responde 401
  ✓  mesma mensagem do e-mail existente

↳ POST /api/auth/login
  POST http://localhost:3000/api/auth/login [200 OK, 549B, 41ms]
  ✓  responde 200
  ✓  devolve token e usuário sem hash
  ┌
  │ `Using "atob" is deprecated. Use "require('atob')" ins
  │ tead.`
  └
  ✓  token vale oito horas

↳ GET /api/auth/eu
  GET http://localhost:3000/api/auth/eu [200 OK, 346B, 7ms]
  ✓  responde 200
  ✓  devolve o usuário autenticado

↳ GET /api/dispositivos sem token
  GET http://localhost:3000/api/dispositivos [401 Unauthorized, 347B, 2ms]
  ✓  responde 401

❏ Dispositivos (US22)
↳ GET /api/grandezas
  GET http://localhost:3000/api/grandezas [200 OK, 1.04kB, 8ms]
  ✓  responde 200
  ✓  lista grandezas

↳ GET /api/tipos-dispositivo
  GET http://localhost:3000/api/tipos-dispositivo [200 OK, 3.08kB, 9ms]
  ✓  responde 200
  ✓  traz o sensor de nível com os campos próprios

↳ GET /api/territorio/localizar
  GET http://localhost:3000/api/territorio/localizar?latitude=-25.09514&longitude=-50.16187 [200 OK, 295B, 11ms]
  ✓  responde 200
  ✓  bairro e distrito pela coordenada

↳ GET /api/territorio/localizar fora do município
  GET http://localhost:3000/api/territorio/localizar?latitude=-23.55&longitude=-46.63 [422 Unprocessable Entity, 370B, 10ms]
  ✓  responde 422

↳ GET /api/dispositivos ordenado por situação
  GET http://localhost:3000/api/dispositivos?ordem=situacao&direcao=desc [200 OK, 7.7kB, 35ms]
  ✓  responde 200
  ✓  cada item traz as colunas da listagem

↳ GET /api/dispositivos com ordenação inválida
  GET http://localhost:3000/api/dispositivos?ordem=xyz [400 Bad Request, 321B, 8ms]
  ✓  responde 400

↳ POST /api/dispositivos
  POST http://localhost:3000/api/dispositivos [201 Created, 760B, 25ms]
  ✓  responde 201
  ✓  bairro calculado pela coordenada
  ✓  atributos do tipo gravados

↳ POST /api/dispositivos com código repetido
  POST http://localhost:3000/api/dispositivos [409 Conflict, 385B, 11ms]
  ✓  responde 409
  ✓  mensagem cita o código

↳ GET /api/dispositivos/{id}
  GET http://localhost:3000/api/dispositivos/15 [200 OK, 755B, 12ms]
  ✓  responde 200
  ✓  é o dispositivo cadastrado

↳ PATCH /api/dispositivos/{id} inativa
  PATCH http://localhost:3000/api/dispositivos/15 [200 OK, 749B, 27ms]
  ✓  responde 200
  ✓  fica inativo, sem excluir

↳ GET /api/dispositivos/{id}/leituras após inativar
  GET http://localhost:3000/api/dispositivos/15/leituras [200 OK, 235B, 14ms]
  ✓  responde 200
  ✓  histórico continua acessível

↳ GET /api/dispositivos/{id} inexistente
  GET http://localhost:3000/api/dispositivos/999999999 [404 Not Found, 321B, 11ms]
  ✓  responde 404

❏ Regras de alerta (US23)
↳ GET /api/regras-alerta
  GET http://localhost:3000/api/regras-alerta [200 OK, 1.47kB, 10ms]
  ✓  responde 200
  ✓  lista as regras

↳ POST /api/regras-alerta
  POST http://localhost:3000/api/regras-alerta [201 Created, 423B, 13ms]
  ✓  responde 201
  ✓  devolve os campos da regra

↳ POST /api/regras-alerta sem limite, sem operador e com duração negativa
  POST http://localhost:3000/api/regras-alerta [400 Bad Request, 407B, 7ms]
  ✓  responde 400
  ✓  mensagem para cada caso

↳ GET /api/regras-alerta/{id}
  GET http://localhost:3000/api/regras-alerta/8 [200 OK, 418B, 8ms]
  ✓  responde 200

↳ PATCH /api/regras-alerta/{id} altera o limite
  PATCH http://localhost:3000/api/regras-alerta/8 [200 OK, 418B, 14ms]
  ✓  responde 200
  ✓  novo limite gravado

↳ PATCH /api/regras-alerta/{id} desativa
  PATCH http://localhost:3000/api/regras-alerta/8 [200 OK, 419B, 14ms]
  ✓  responde 200
  ✓  desativada, sem excluir

↳ GET /api/regras-alerta/{id}/alteracoes
  GET http://localhost:3000/api/regras-alerta/8/alteracoes [200 OK, 808B, 10ms]
  ✓  responde 200
  ✓  registra o limite anterior e o novo, com autor

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │               26 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │               26 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               47 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 774ms                                     │
├───────────────────────────────────────────────────────────────┤
│ total data received: 16.7kB (approx)                          │
├───────────────────────────────────────────────────────────────┤
│ average response time: 17ms [min: 2ms, max: 68ms, s.d.: 14ms] │
└───────────────────────────────────────────────────────────────┘
```
