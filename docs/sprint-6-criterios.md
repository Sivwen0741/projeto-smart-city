# Critérios de aceite da Sprint 6

**Situação: aprovados em 24/10/2026.** Nenhum documento do projeto traz
critérios para as histórias da Sprint 6. A ordem é a do backlog (seção 2.5 do replanejamento):
US06, US07, US09, US10, US12, US17, US18, US19, US21, US26 e US27. Cada critério terá um teste com
o número no nome.

Fontes: histórias da `sprint-1.md`, Documento de Visão (seções 7 e 9), protótipo
(`02-painel.svg`, `03-alertas.svg`, `04-ocorrencia.svg`, `05-dispositivos.svg`) e o que já está
implantado.

## Correção anterior à Sprint 6

**TT02-9.** As leituras do simulador são gravadas com origem `simulador` e a interface identifica
como simulados os dispositivos e os valores que vêm dele (Documento de Visão, seção 9.2: as
variáveis do simulador são "identificadas como tais na interface").

## US06 - Atualizar a situação de uma ocorrência até a resolução

1. A aba "Ocorrências" lista as ocorrências com protocolo, gravidade, categoria, bairro, órgão,
   situação e tempo em aberto; abertas e em atendimento primeiro.
2. A tela de detalhe segue `04-ocorrencia.svg`: dados, descrição, localização, alertas vinculados
   e o histórico do atendimento em ordem cronológica.
3. O operador registra providências e muda a situação (aberta, em atendimento, encerrada); cada
   mudança entra no histórico com autor, data, hora e observação.
4. Encerrar exige observação, grava a data de encerramento e encerra os alertas vinculados que
   ainda estiverem em atendimento.
5. A ocorrência encerrada sai do mapa e da lista de abertas, e continua consultável.
6. Cada atualização gera registro no log de atividades e aparece em tempo real para os demais.

## US07 - Aviso quando um dispositivo parar de enviar dados

1. Uma rotina agendada verifica, a cada minuto, os dispositivos ativos que passaram do limite de
   comunicação da US22 e emite um alerta "sem comunicação", de gravidade atenção.
2. Há no máximo um alerta de sem comunicação ativo por dispositivo.
3. O alerta é encerrado automaticamente quando o dispositivo volta a se comunicar, se ainda não
   tiver sido reconhecido.
4. Dispositivo em manutenção ou inativo não gera esse alerta.

## US09 - Nível e vazão dos rios em tempo real

1. Uma rotina agendada consulta a vazão diária e a previsão de cheia do Open-Meteo (Flood API)
   para os pontos dos arroios monitorados e grava as leituras com origem `open-meteo`.
2. Uma tela "Rios" mostra, por ponto monitorado, o nível atual dos sensores, a vazão do
   Open-Meteo, a tendência da última hora e a cota da regra de alerta.
3. Os valores mudam em tempo real, sem recarregar a página.
4. Falha da fonte externa não derruba a rotina: a tela mostra a hora da última coleta.

## US10 - Alerta automático de risco de enchente

1. A regra de risco de enchente dispara quando o nível do arroio passa da cota e a precipitação
   ou a previsão de vazão também passa do limite no mesmo bairro, dentro de uma janela de tempo.
2. O alerta informa as duas leituras que o compõem.
3. Os limites dessa regra são configuráveis pela tela de regras, como na US23.

## US12 - Painel com os indicadores-chave da cidade

1. Os indicadores da faixa do painel (`02-painel.svg`) são calculados a partir das leituras: nível
   dos rios, fluxo de veículos, qualidade do ar, iluminação pública, ruído urbano e vagas.
2. Cada indicador mostra valor, unidade, variação e a nota do protótipo, e fica vermelho quando
   há alerta ativo da grandeza.
3. Indicador sem leitura na última hora aparece como sem dados, sem valor inventado.
4. Os gráficos "Ocorrências abertas hoje" e "Ocorrências por bairro" usam as ocorrências
   registradas.
5. Tudo se atualiza em tempo real.

## US17 - Qualidade do ar por região

1. Uma rotina agendada consulta o Open-Meteo (Air Quality API) para o centro de cada bairro e
   grava PM2.5, PM10 e índice de qualidade do ar.
2. O mapa ganha a camada "Qualidade do ar", com os bairros coloridos pela faixa do índice.
3. Clicar no bairro mostra os valores e a hora da última coleta.

## US18 - Alerta quando a poluição ultrapassar o limite configurado

1. As regras de PM2.5 e PM10 da US23 passam a valer também para as leituras do Open-Meteo de cada
   bairro.
2. O alerta indica o bairro e a fonte do dado.
3. O órgão Meio Ambiente aparece como responsável sugerido ao abrir ocorrência a partir desse
   alerta.

## US19 - Gráfico histórico de uma variável monitorada

1. "Ver histórico" no painel do dispositivo abre o gráfico da grandeza ao longo do tempo, com
   escolha de período (24 h, 7 dias, 30 dias).
2. O gráfico mostra a linha do limite das regras ativas da grandeza.
3. A coluna "Últimas 3 h" da tela de dispositivos mostra o minigráfico do protótipo.
4. Períodos longos são agregados no banco, sem trazer todas as leituras para a tela.

## US21 - Gerenciar usuários e perfis de acesso por órgão

1. O administrador cadastra, edita e inativa usuários com nome, e-mail funcional, órgão e perfil,
   sem excluir.
2. Os perfis têm permissões (consultar, operar, configurar, administrar), e as rotas recusam com
   403 o que o perfil não permite.
3. Usuário de um órgão vê as ocorrências de todos, mas só atualiza as do próprio órgão.
4. Toda alteração de usuário ou perfil gera registro no log de atividades.

## US26 - Localizar uma ocorrência pelo protocolo, endereço ou dispositivo

1. A busca do cabeçalho procura por protocolo, endereço, bairro e código de dispositivo, a partir
   de três caracteres.
2. Os resultados aparecem agrupados (ocorrências, dispositivos) e abrem o detalhe correspondente.
3. A busca não diferencia maiúsculas nem acentos.

## US27 - Ligar e desligar as camadas do mapa

1. O painel "Camadas" de `02-painel.svg` liga e desliga sensores, câmeras, semáforos, estações
   ambientais, mapa de calor e limites de bairro.
2. A escolha fica guardada para o usuário no navegador.
3. A legenda passa a contar só o que está visível.

## Fora destes critérios

Filtros (US08), previsão do tempo (US11), fluxo de veículos com o TomTom (US13), mapa de calor de
ocorrências como análise (US14), comparação de períodos (US15), relatório em PDF (US16), log de
atividades em tela (US24) e exportação (US25) continuam no backlog. A camada "Mapa de calor" da
US27 usa as ocorrências já registradas, sem a análise da US14.

## Telas que não existem no protótipo

Precisam de desenho e aprovação antes da implementação: lista de ocorrências (US06), tela "Rios"
(US09), camada de qualidade do ar (US17), gráfico histórico (US19), usuários e perfis (US21,
depende do DT03) e resultados da busca (US26).
