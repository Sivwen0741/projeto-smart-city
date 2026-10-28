# Validação das rotas das Sprints 4 a 6 com a coleção do Postman

- **Data:** 27/10/2026
- **Ambiente:** ambiente de desenvolvimento (`docker compose up`), com o banco reaproveitado das
  rodadas anteriores e o simulador ligado, na branch `sprint-6-testes-unidade` (commit `596f7ea`, a
  `main` depois do merge da Sprint 6 mais a suíte de unidade). Não foi um clone limpo: a execução
  oficial, sobre a tag do corte, entra no log de execução do checkpoint 2.
- **Coleção:** [`scoc.postman_collection.json`](scoc.postman_collection.json), agora com a pasta da
  Sprint 6: 74 requisições (38 das Sprints 4 e 5 e 36 da Sprint 6) e 133 verificações. A pasta nova
  cobre US06, US07, US09, US10, US12, US26, US21, US18 e US19, inclusive um usuário de perfil
  Consulta criado pela própria coleção para as recusas com 403, depois inativado.
- **Como foi executada:** pelo Newman 6.2.3, pelo autor do código. **A coleção não foi aberta no
  aplicativo Postman.**
- **Resultado:** 74 requisições e 133 verificações, nenhuma falha.

```sh
npx newman run docs/postman/scoc.postman_collection.json --env-var "senha=<ADMIN_SENHA>"
```

## Saída da execução

```text
SCOC - Sprints 4 a 6
❏ Saúde e autenticação (TT01, US20)
↳ GET /api/health sem token
  GET http://localhost:3000/api/health [200 OK, 270B, 26ms]
  ✓  responde 200
↳ POST /api/auth/login sem senha
  POST http://localhost:3000/api/auth/login [400 Bad Request, 397B, 17ms]
  ✓  responde 400
↳ POST /api/auth/login com senha errada
  POST http://localhost:3000/api/auth/login [401 Unauthorized, 326B, 73ms]
  ✓  responde 401
  ✓  mensagem genérica
↳ POST /api/auth/login com e-mail inexistente
  POST http://localhost:3000/api/auth/login [401 Unauthorized, 326B, 47ms]
  ✓  responde 401
  ✓  mesma mensagem do e-mail existente
↳ POST /api/auth/login
  POST http://localhost:3000/api/auth/login [200 OK, 626B, 63ms]
  ✓  responde 200
  ✓  devolve token e usuário sem hash
  ┌
  │ `Using "atob" is deprecated. Use "require('atob')" ins
  │ tead.`
  └
  ✓  token vale oito horas
↳ GET /api/auth/eu
  GET http://localhost:3000/api/auth/eu [200 OK, 423B, 12ms]
  ✓  responde 200
  ✓  devolve o usuário autenticado
↳ GET /api/dispositivos sem token
  GET http://localhost:3000/api/dispositivos [401 Unauthorized, 347B, 3ms]
  ✓  responde 401
❏ Dispositivos (US22)
↳ GET /api/grandezas
  GET http://localhost:3000/api/grandezas [200 OK, 1.12kB, 11ms]
  ✓  responde 200
  ✓  lista grandezas
↳ GET /api/tipos-dispositivo
  GET http://localhost:3000/api/tipos-dispositivo [200 OK, 3.5kB, 13ms]
  ✓  responde 200
  ✓  traz o sensor de nível com os campos próprios
↳ GET /api/territorio/localizar
  GET http://localhost:3000/api/territorio/localizar?latitude=-25.09514&longitude=-50.16187 [200 OK, 295B, 31ms]
  ✓  responde 200
  ✓  bairro e distrito pela coordenada
↳ GET /api/territorio/localizar fora do município
  GET http://localhost:3000/api/territorio/localizar?latitude=-23.55&longitude=-46.63 [422 Unprocessable Entity, 370B, 11ms]
  ✓  responde 422
↳ GET /api/dispositivos ordenado por situação
  GET http://localhost:3000/api/dispositivos?ordem=situacao&direcao=desc [200 OK, 9.81kB, 99ms]
  ✓  responde 200
  ✓  cada item traz as colunas da listagem
↳ GET /api/dispositivos com ordenação inválida
  GET http://localhost:3000/api/dispositivos?ordem=xyz [400 Bad Request, 321B, 101ms]
  ✓  responde 400
↳ POST /api/dispositivos
  POST http://localhost:3000/api/dispositivos [201 Created, 834B, 152ms]
  ✓  responde 201
  ✓  bairro calculado pela coordenada
  ✓  atributos do tipo gravados
↳ POST /api/dispositivos com código repetido
  POST http://localhost:3000/api/dispositivos [409 Conflict, 385B, 16ms]
  ✓  responde 409
  ✓  mensagem cita o código
↳ GET /api/dispositivos/{id}
  GET http://localhost:3000/api/dispositivos/15 [200 OK, 829B, 20ms]
  ✓  responde 200
  ✓  é o dispositivo cadastrado
↳ PATCH /api/dispositivos/{id} inativa
  PATCH http://localhost:3000/api/dispositivos/15 [200 OK, 823B, 44ms]
  ✓  responde 200
  ✓  fica inativo, sem excluir
↳ GET /api/dispositivos/{id}/leituras após inativar
  GET http://localhost:3000/api/dispositivos/15/leituras [200 OK, 235B, 21ms]
  ✓  responde 200
  ✓  histórico continua acessível
↳ GET /api/dispositivos/{id} inexistente
  GET http://localhost:3000/api/dispositivos/999999999 [404 Not Found, 321B, 17ms]
  ✓  responde 404
❏ Regras de alerta (US23)
↳ GET /api/regras-alerta
  GET http://localhost:3000/api/regras-alerta [200 OK, 2.77kB, 15ms]
  ✓  responde 200
  ✓  lista as regras
↳ POST /api/regras-alerta
  POST http://localhost:3000/api/regras-alerta [201 Created, 530B, 17ms]
  ✓  responde 201
  ✓  devolve os campos da regra
↳ POST /api/regras-alerta sem limite, sem operador e com duração negativa
  POST http://localhost:3000/api/regras-alerta [400 Bad Request, 407B, 16ms]
  ✓  responde 400
  ✓  mensagem para cada caso
↳ GET /api/regras-alerta/{id}
  GET http://localhost:3000/api/regras-alerta/10 [200 OK, 525B, 15ms]
  ✓  responde 200
↳ PATCH /api/regras-alerta/{id} altera o limite
  PATCH http://localhost:3000/api/regras-alerta/10 [200 OK, 525B, 35ms]
  ✓  responde 200
  ✓  novo limite gravado
↳ PATCH /api/regras-alerta/{id} desativa
  PATCH http://localhost:3000/api/regras-alerta/10 [200 OK, 526B, 31ms]
  ✓  responde 200
  ✓  desativada, sem excluir
↳ GET /api/regras-alerta/{id}/alteracoes
  GET http://localhost:3000/api/regras-alerta/10/alteracoes [200 OK, 808B, 24ms]
  ✓  responde 200
  ✓  registra o limite anterior e o novo, com autor
❏ Sprint 5: mapa, alertas e ocorrências (US01 a US05, US28)
↳ GET /api/territorio/bairros
  GET http://localhost:3000/api/territorio/bairros [200 OK, 52.46kB, 153ms]
  ✓  responde 200
  ✓  contornos dos bairros em GeoJSON
↳ GET /api/ocorrencias/categorias
  GET http://localhost:3000/api/ocorrencias/categorias [200 OK, 377B, 9ms]
  ✓  responde 200
  ✓  lista de categorias
↳ GET /api/orgaos
  GET http://localhost:3000/api/orgaos [200 OK, 510B, 10ms]
  ✓  responde 200
  ✓  traz a Defesa Civil
↳ POST /api/ocorrencias sem categoria
  POST http://localhost:3000/api/ocorrencias [400 Bad Request, 319B, 9ms]
  ✓  responde 400
  ✓  pede a categoria
↳ POST /api/ocorrencias
  POST http://localhost:3000/api/ocorrencias [201 Created, 642B, 38ms]
  ✓  responde 201
  ✓  protocolo no formato ano-mês-sequência
  ✓  origem telefone, situação aberta e bairro calculado
↳ GET /api/ocorrencias
  GET http://localhost:3000/api/ocorrencias [200 OK, 1.03kB, 171ms]
  ✓  responde 200
  ✓  lista as abertas com coordenada
↳ GET /api/alertas/resumo
  GET http://localhost:3000/api/alertas/resumo [200 OK, 1.18kB, 62ms]
  ✓  responde 200
  ✓  indicadores da tela de alertas
↳ GET /api/alertas
  GET http://localhost:3000/api/alertas?visao=ativos [200 OK, 2.21kB, 30ms]
  ✓  responde 200
  ✓  ordenados por gravidade
↳ GET /api/alertas com visão inválida
  GET http://localhost:3000/api/alertas?visao=todos [400 Bad Request, 358B, 9ms]
  ✓  responde 400
↳ POST /api/alertas/{id}/reconhecimento sem providência
  POST http://localhost:3000/api/alertas/3/reconhecimento [400 Bad Request, 330B, 9ms]
  ✓  responde 400
↳ POST /api/alertas/{id}/reconhecimento
  POST http://localhost:3000/api/alertas/3/reconhecimento [200 OK, 937B, 63ms]
  ✓  responde 200
  ✓  passa a em atendimento
↳ POST /api/alertas/{id}/reconhecimento de novo
  POST http://localhost:3000/api/alertas/3/reconhecimento [409 Conflict, 1.1kB, 29ms]
  ✓  responde 409
  ✓  diz quem reconheceu
❏ Sprint 6 (US06, US07, US09, US10, US12, US26, US21, US18, US19) / Ocorrências até a resolução (US06)
↳ POST /api/ocorrencias para o atendimento
  POST http://localhost:3000/api/ocorrencias [201 Created, 643B, 26ms]
  ✓  responde 201
↳ GET /api/ocorrencias em andamento
  GET http://localhost:3000/api/ocorrencias?visao=andamento [200 OK, 1.43kB, 12ms]
  ✓  responde 200
  ✓  traz a ocorrência nova
  ✓  abertas antes das em atendimento
↳ GET /api/ocorrencias com visão inválida
  GET http://localhost:3000/api/ocorrencias?visao=todas [400 Bad Request, 339B, 8ms]
  ✓  responde 400
↳ POST /api/ocorrencias/{id}/providencias primeira providência
  POST http://localhost:3000/api/ocorrencias/3/providencias [200 OK, 646B, 22ms]
  ✓  responde 200
  ✓  passa a em atendimento
↳ POST /api/ocorrencias/{id}/providencias encerra sem observação
  POST http://localhost:3000/api/ocorrencias/3/providencias [400 Bad Request, 398B, 9ms]
  ✓  responde 400
↳ POST /api/ocorrencias/{id}/providencias encerra
  POST http://localhost:3000/api/ocorrencias/3/providencias [200 OK, 663B, 27ms]
  ✓  responde 200
  ✓  encerrada com data
↳ POST /api/ocorrencias/{id}/providencias depois de encerrada
  POST http://localhost:3000/api/ocorrencias/3/providencias [409 Conflict, 336B, 27ms]
  ✓  responde 409
↳ GET /api/ocorrencias/{id} com o histórico
  GET http://localhost:3000/api/ocorrencias/3 [200 OK, 1.51kB, 35ms]
  ✓  responde 200
  ✓  histórico com abertura e as duas providências
↳ GET /api/ocorrencias encerradas
  GET http://localhost:3000/api/ocorrencias?visao=encerradas [200 OK, 665B, 16ms]
  ✓  responde 200
  ✓  a encerrada continua consultável
❏ Sprint 6 (US06, US07, US09, US10, US12, US26, US21, US18, US19) / Sem comunicação, rios e enchente (US07, US09, US10)
↳ GET /api/regras-alerta com as regras do sistema e de enchente
  GET http://localhost:3000/api/regras-alerta [200 OK, 3.06kB, 17ms]
  ✓  responde 200
  ✓  regra do sistema de sem comunicação (US07)
  ✓  regra de risco de enchente com os três limites (US10)
↳ PATCH /api/regras-alerta/{id} da regra do sistema
  PATCH http://localhost:3000/api/regras-alerta/8 [409 Conflict, 333B, 11ms]
  ✓  responde 409
↳ PATCH /api/regras-alerta/{id} com campos de enchente numa regra simples
  PATCH http://localhost:3000/api/regras-alerta/10 [400 Bad Request, 383B, 12ms]
  ✓  responde 400
↳ GET /api/rios
  GET http://localhost:3000/api/rios [200 OK, 2.73kB, 64ms]
  ✓  responde 200
  ✓  um ponto por sensor de nível, com a vazão do Open-Meteo
❏ Sprint 6 (US06, US07, US09, US10, US12, US26, US21, US18, US19) / Painel e busca (US12, US26)
↳ GET /api/painel
  GET http://localhost:3000/api/painel [200 OK, 2.11kB, 154ms]
  ✓  responde 200
  ✓  os seis indicadores na ordem do protótipo
  ✓  qualidade do ar pelo IQAr
  ✓  os dois gráficos de ocorrências
↳ GET /api/busca com dois caracteres
  GET http://localhost:3000/api/busca?q=ab [400 Bad Request, 342B, 31ms]
  ✓  responde 400
↳ GET /api/busca sem acento
  GET http://localhost:3000/api/busca?q=cara [200 OK, 431B, 89ms]
  ✓  responde 200
  ✓  resultados agrupados
  ✓  acha Cará-Cará sem acento
↳ GET /api/busca sem token
  GET http://localhost:3000/api/busca?q=centro [401 Unauthorized, 347B, 3ms]
  ✓  responde 401
❏ Sprint 6 (US06, US07, US09, US10, US12, US26, US21, US18, US19) / Usuários e perfis (US21)
↳ GET /api/perfis
  GET http://localhost:3000/api/perfis [200 OK, 749B, 30ms]
  ✓  responde 200
  ✓  quatro perfis que acumulam permissões
↳ POST /api/usuarios com e-mail fora do domínio
  POST http://localhost:3000/api/usuarios [400 Bad Request, 348B, 12ms]
  ✓  responde 400
↳ POST /api/usuarios com perfil de consulta
  POST http://localhost:3000/api/usuarios [201 Created, 483B, 90ms]
  ✓  responde 201
  ✓  senha provisória de 12 caracteres
↳ POST /api/auth/login com o usuário de consulta
  POST http://localhost:3000/api/auth/login [200 OK, 604B, 67ms]
  ✓  responde 200
  ✓  só consultar
↳ GET /api/painel com o perfil de consulta
  GET http://localhost:3000/api/painel [200 OK, 2.11kB, 96ms]
  ✓  responde 200
↳ POST /api/ocorrencias com o perfil de consulta
  POST http://localhost:3000/api/ocorrencias [403 Forbidden, 329B, 8ms]
  ✓  responde 403
  ✓  explica o motivo
↳ GET /api/usuarios com o perfil de consulta
  GET http://localhost:3000/api/usuarios [403 Forbidden, 329B, 8ms]
  ✓  responde 403
↳ PATCH /api/usuarios/{id} muda para operador
  PATCH http://localhost:3000/api/usuarios/3 [200 OK, 455B, 21ms]
  ✓  responde 200
  ✓  perfil operador
↳ POST /api/usuarios/{id}/senha-provisoria
  POST http://localhost:3000/api/usuarios/3/senha-provisoria [200 OK, 269B, 66ms]
  ✓  responde 200
  ✓  nova senha diferente da anterior
↳ POST /api/auth/login com a senha anterior
  POST http://localhost:3000/api/auth/login [401 Unauthorized, 326B, 46ms]
  ✓  responde 401
↳ PATCH /api/usuarios/{id} inativa
  PATCH http://localhost:3000/api/usuarios/3 [200 OK, 456B, 16ms]
  ✓  responde 200
  ✓  inativo
↳ GET /api/painel com o token do usuário inativado
  GET http://localhost:3000/api/painel [401 Unauthorized, 347B, 9ms]
  ✓  responde 401
↳ DELETE /api/usuarios/{id}
  DELETE http://localhost:3000/api/usuarios/3 [404 Not Found, 322B, 2ms]
  ✓  responde 404
❏ Sprint 6 (US06, US07, US09, US10, US12, US26, US21, US18, US19) / Poluição por bairro e histórico (US18, US19)
↳ GET /api/alertas com fonte e órgão sugerido
  GET http://localhost:3000/api/alertas?visao=ativos [200 OK, 2.27kB, 56ms]
  ✓  responde 200
  ✓  todo alerta informa fonte e órgão sugerido (US18)
  ✓  poluição sugere órgão, as outras grandezas não
↳ GET /api/dispositivos com o minigráfico das últimas 3 h
  GET http://localhost:3000/api/dispositivos [200 OK, 10.33kB, 71ms]
  ✓  responde 200
  ✓  nove barras ou nulo (US19-3)
↳ GET /api/dispositivos/{id}/historico de 24 h
  GET http://localhost:3000/api/dispositivos/11/historico?periodo=24h [200 OK, 2.97kB, 34ms]
  ✓  responde 200
  ✓  blocos de 5 min
  ✓  média entre mínimo e máximo
↳ GET /api/dispositivos/{id}/historico de 30 dias
  GET http://localhost:3000/api/dispositivos/11/historico?periodo=30d [200 OK, 1.87kB, 33ms]
  ✓  responde 200
  ✓  agregado por hora, no máximo um ponto por hora
↳ GET /api/dispositivos/{id}/historico com período inválido
  GET http://localhost:3000/api/dispositivos/11/historico?periodo=1a [400 Bad Request, 332B, 12ms]
  ✓  responde 400
↳ GET /api/dispositivos/{id}/historico de grandeza sem leitura
  GET http://localhost:3000/api/dispositivos/11/historico?grandeza=consumo_inexistente [400 Bad Request, 376B, 35ms]
  ✓  responde 400
┌─────────────────────────┬───────────────────┬──────────────────┐
│                         │          executed │           failed │
├─────────────────────────┼───────────────────┼──────────────────┤
│              iterations │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│                requests │                74 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│            test-scripts │                74 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│      prerequest-scripts │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│              assertions │               133 │                0 │
├─────────────────────────┴───────────────────┴──────────────────┤
│ total run duration: 3.9s                                       │
├────────────────────────────────────────────────────────────────┤
│ total data received: 112.96kB (approx)                         │
├────────────────────────────────────────────────────────────────┤
│ average response time: 37ms [min: 2ms, max: 171ms, s.d.: 37ms] │
└────────────────────────────────────────────────────────────────┘
```
