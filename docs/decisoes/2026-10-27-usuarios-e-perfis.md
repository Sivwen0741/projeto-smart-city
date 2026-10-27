# Usuários e perfis de acesso

- **Data:** 27/10/2026
- **Item:** US21, critérios 1 a 4 (`docs/sprint-6-criterios.md`)
- **Situação:** aceita

## Contexto

Até a Sprint 5 só existia o perfil `administrador`, criado na subida, e todas as rotas autenticadas
aceitavam qualquer usuário. O esquema já tinha `perfil`, `permissao` e `perfil_permissao` (DER),
sem uso. A prancheta da Sprint 6 (`2026-10-25-prancheta-sprint-6.md`) aprovou quatro perfis fixos,
inativar no lugar de excluir, senha provisória gerada pelo administrador e a aba Usuários apagada
para quem não administra.

## Alternativas consideradas

1. **Perfis editáveis pelo administrador.** Não há história para isso e aumentaria a superfície de
   erro de permissão.
2. **Conferir o nome do perfil em cada rota.** Espalharia a regra; a tabela `perfil_permissao` já
   existe para separar perfil de permissão.
3. **Quatro perfis fixos, cada um com as permissões do anterior, e a rota exigindo uma permissão**
   (escolhida).

## Decisão

| Perfil | Permissões |
|---|---|
| Consulta | consultar |
| Operador | consultar, operar |
| Gestor | consultar, operar, configurar |
| Administrador | consultar, operar, configurar, administrar |

- **Permissão de cada rota:** leitura exige `consultar`; reconhecer alerta, registrar ocorrência e
  registrar providência exigem `operar`; cadastrar e editar dispositivos e regras de alerta exigem
  `configurar`; usuários e perfis exigem `administrar`. O guard global aplica `consultar` a `GET` e
  `operar` às demais rotas sem marca, de modo que rota nova sem marca nunca fica aberta a quem só
  consulta. A recusa é 403 "Seu perfil não permite esta ação.", antes da validação do corpo.
- As permissões vêm do banco a cada requisição: mudar o perfil ou inativar vale na hora, sem
  esperar o token expirar.
- **Órgão (US21-3):** todos veem todas as ocorrências; só atualiza (providência e encerramento)
  quem é do órgão responsável. Ocorrência sem órgão pode ser atualizada por qualquer operador. O
  administrador atualiza a de qualquer órgão, para corrigir atendimento parado.
- **E-mail funcional:** só o domínio `@pontagrossa.pr.gov.br`, gravado em minúsculas e único.
- **Senha provisória:** 12 caracteres sem os que se confundem (0/o, 1/l/i), mostrada uma única vez
  ao administrador; gerar outra invalida a anterior. Não há troca obrigatória no primeiro acesso,
  porque a troca da própria senha não tem história.
- **Proteções:** o administrador não inativa nem muda o próprio perfil, para o sistema não ficar sem
  administrador por engano. Não há rota de exclusão.
- **Log (US21-4):** `cadastro_usuario`, `edicao_usuario` (só os campos que mudaram, com antes e
  depois) e `senha_provisoria_usuario`, sempre com o autor. A senha não vai para o log.
- **Tela:** a aba Usuários abre para o administrador e fica apagada para os outros perfis. Nas
  demais telas, os botões que o perfil não permite ficam desabilitados com o motivo no título, e o
  detalhe da ocorrência de outro órgão mostra quem pode atualizá-la.

## Consequências

- Os testes existentes entram como administrador e continuaram passando sem mudança.
- Os perfis e permissões são carregados na subida, como o administrador inicial; a cada subida o
  `ON CONFLICT` consome valores da sequência de `perfil`, sem efeito além da numeração.
- Não há perfil por órgão nem permissão por grandeza; se aparecer a necessidade, a tabela
  `perfil_permissao` comporta perfis novos sem mudar as rotas.
