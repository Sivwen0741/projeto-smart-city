# Documentação Swagger pública como exceção ao critério US20-1

- **Data:** 20/10/2026
- **Item:** US20, critério 1
- **Situação:** aceita

## Contexto

O critério US20-1 diz que nenhuma rota além da autenticação responde sem token válido. A
Definition of Done da Sprint 4 (seção 3.4) exige que a interface de programação esteja
documentada no Swagger e validada no Postman, e o ambiente precisa de uma verificação de saúde
para o Docker Compose decidir quando a interface web pode subir.

## Alternativas consideradas

1. **Swagger atrás do token.** Cumpre a letra do critério, mas a página do Swagger é carregada
   pelo navegador sem cabeçalho de autorização. Quem vai validar a API teria de obter um token
   por outro meio antes de ler a documentação.
2. **Swagger só em desenvolvimento.** Some no ambiente usado na revisão da sprint e na
   apresentação, justamente onde a DoD pede a documentação.
3. **Swagger e verificação de saúde públicos, como exceção explícita** (escolhida).

## Decisão

Respondem sem token apenas:

| Rota | Motivo |
|---|---|
| `POST /api/auth/login` | A própria autenticação |
| `GET /api/health` | Healthcheck do Docker Compose; devolve só a situação e a versão do PostGIS |
| `/api/docs` e `/api/docs-json` | Documentação exigida pela Definition of Done |

Todas as demais rotas passam por uma guarda global. Uma rota nova nasce protegida e só fica
pública se receber o decorador `@Publico()` de forma explícita.

## Consequências

- A documentação mostra a estrutura da API, mas nenhuma operação documentada responde sem token.
- O teste `US20-1 toda rota documentada fora login e health responde 401 sem token` percorre
  o documento do Swagger e falha se alguma rota nova ficar aberta sem estar nesta lista.
- Em uma implantação real, fora do escopo da disciplina, a documentação poderia ser restrita
  pela rede, sem mudança no código.
