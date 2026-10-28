# Telas da Sprint 6 fora do protótipo

- **Data:** 25/10/2026
- **Item:** US06, US09, US17, US19, US21 e US26 (`docs/sprint-6-criterios.md`, "Telas que não existem no protótipo")
- **Situação:** aceita (prancheta aprovada pelo autor em 25/10/2026)

## Contexto

Seis telas da Sprint 6 não existem no protótipo. Pela regra do projeto, foram desenhadas a partir
de `design/00-identidade.svg` e dos padrões já implantados, numa prancheta única, e aprovadas antes
da US06. O DT03 pedia o protótipo das telas de relatórios e de usuários; esta decisão resolve a
parte de usuários.

## Alternativas consideradas

1. **Abas novas no menu para "Rios" e para a qualidade do ar.** Alteraria o protótipo, que não se
   altera; a tela de rios abre pelo indicador do painel e a qualidade do ar é uma camada do mapa.
2. **Gráfico histórico num painel lateral.** A largura do painel não comporta 30 dias de leitura;
   o gráfico ganhou tela própria.
3. **Perfis editáveis na tela de usuários.** Não há história para isso; os perfis ficam fixos.

## Decisão

- **Ocorrências (US06):** visões "Em andamento" (abertas e em atendimento) e "Encerradas" (últimos
  30 dias). Em andamento, abertas antes de em atendimento, depois por gravidade e da mais antiga. O
  detalhe segue `04-ocorrencia.svg` sem controle novo: a primeira providência passa a ocorrência
  aberta para em atendimento, e encerrar usa o texto da caixa como observação obrigatória. A aba
  mostra o número de abertas.
- **Rios (US09):** rota `/rios`, aberta pelo indicador "Nível dos rios" do painel; um cartão por
  arroio com o nível do sensor, a vazão do Open-Meteo, a tendência da última hora e a cota.
- **Qualidade do ar (US17):** linha nova no painel "Camadas"; bairros pintados com as cores de
  estado do guia pelas faixas do índice de qualidade do ar dos EUA (até 50 boa, até 100 moderada,
  acima insalubre, sem coleta em parado). Substituído em 27/10/2026 pelo IQAr da Resolução Conama
  nº 506/2024 (`2026-10-27-indice-de-qualidade-do-ar.md`); as cores da camada serão desenhadas de novo.
- **Histórico (US19):** rota `/dispositivos/:id/historico`; 24 h com média por 5 min, 7 e 30 dias com
  média por hora e a faixa entre mínimo e máximo; linha tracejada por regra ativa.
- **Usuários (US21):** perfis fixos Consulta, Operador, Gestor e Administrador; inativar no lugar de
  excluir; senha provisória gerada pelo administrador; a aba aparece apagada para quem não administra.
- **Busca (US26):** lista sob a caixa do cabeçalho, a partir do terceiro caractere, com ocorrências e
  dispositivos, sem diferenciar acentos, com navegação pelo teclado.

## Consequências

- A troca da própria senha continua sem história e fora do escopo.
- Relatórios (US16) seguem no backlog, e com eles a outra metade do DT03.
