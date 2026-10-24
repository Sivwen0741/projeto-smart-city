# Critérios de aceite da Sprint 5

**Situação: aprovados em 24/10/2026.** O replanejamento da Sprint 4 só traz
critérios para os itens da própria Sprint 4 (seção 3.3). A TT02, as histórias US01 a US05 e a US28
não têm critério escrito em nenhum documento do projeto. Estes critérios são a definição de
pronto desses itens, no mesmo formato da seção 3.3. Cada critério terá um teste
com o número no nome.

Fontes: histórias da `sprint-1.md`, Documento de Visão (seções 7.2 a 7.5), protótipo
(`02-painel.svg`, `03-alertas.svg`, `04-ocorrencia.svg`) e o modelo de dados já implantado.

## TT02 - Camada de ingestão e motor de alertas

1. A interface de programação assina no Mosquitto o tópico `scoc/dispositivos/{código}/leituras`
   e grava cada leitura válida na tabela `leitura`, com grandeza, valor, unidade, origem `mqtt` e
   o horário da medição.
2. Cada mensagem aceita atualiza a última comunicação do dispositivo. A situação "sem
   comunicação" da US22 passa a refletir o tráfego real.
3. Mensagem de dispositivo não cadastrado ou inativo, com grandeza que o tipo do dispositivo não
   mede ou com conteúdo inválido é descartada sem derrubar o assinante e fica registrada no log da
   aplicação.
4. Toda leitura gravada de dispositivo ativo é avaliada contra as regras ativas da mesma grandeza.
   O alerta só é emitido quando a condição se mantém pela duração mínima da regra, e a duração
   zero dispara na primeira leitura. Dispositivo em manutenção grava a leitura e não gera alerta.
5. O alerta grava a regra, o dispositivo, a leitura, o valor observado e a cópia do operador, do
   limite e da gravidade vigentes no disparo.
6. Enquanto existir alerta ativo da mesma regra para o mesmo dispositivo, novas leituras fora do
   limite não abrem outro alerta.
7. Se o broker cair, a interface de programação reconecta sozinha e volta a gravar sem reinício.
8. O `docker compose up` sobe um simulador que publica pelo MQTT as leituras dos dispositivos de
   exemplo. A renovação artificial da última comunicação sai da carga inicial.

## US01 - Mapa interativo com dispositivos e ocorrências

1. O mapa, sobre o OpenStreetMap, mostra os dispositivos não inativos na posição cadastrada, com
   a cor da legenda do protótipo: grave e atenção (alerta ativo), normal e sem comunicação.
2. As ocorrências abertas aparecem no mapa com marcador próprio, diferente do de dispositivo.
3. Clicar num marcador mostra o resumo. Para dispositivo: código, tipo, bairro, última leitura e
   situação. Para ocorrência: protocolo, categoria, gravidade e situação.
4. Os limites e os nomes dos bairros são desenhados a partir da base territorial carregada.
5. Marcadores próximos se agrupam, com a contagem, quando o zoom não permite distinguir.
6. A cor dos marcadores e as ocorrências novas mudam sem recarregar a página.

## US02 - Lista de alertas ativos ordenados por gravidade

1. A tela de alertas lista os alertas ativos com gravidade, nome da regra, dispositivo, bairro,
   medição com o limite, horário de detecção, órgão e situação, como no protótipo.
2. A ordem é grave, atenção e informativo. Dentro da mesma gravidade, o mais recente vem primeiro.
3. Os indicadores do topo mostram ativos, graves sem reconhecimento, em atendimento, encerrados
   hoje, tempo médio até o reconhecimento, alertas nas últimas 24 horas e dispositivos sem
   comunicação.
4. O quadro "Alertas ativos" do painel mostra os mesmos alertas na mesma ordem.

## US03 - Novos alertas na tela em tempo real

1. Um alerta novo aparece na lista, no painel, no mapa e no contador do menu em até 2 segundos
   depois da leitura que o disparou, sem recarregar a página.
2. Reconhecimento e encerramento feitos por outro operador também aparecem em tempo real.
3. A conexão em tempo real exige o mesmo token da interface de programação e é recusada sem ele.
4. Se a conexão cair, a tela reconecta sozinha e busca de novo a lista, sem perder alerta emitido
   no intervalo.

## US28 - Alerta grave visível até ser reconhecido

1. Alertas de atenção e informativos sem reconhecimento são encerrados automaticamente quando a
   leitura volta ao normal. O alerta grave sem reconhecimento nunca é encerrado automaticamente.
2. Enquanto houver alerta grave sem reconhecimento, uma faixa fixa aparece em todas as telas
   autenticadas, com a quantidade e o acesso ao alerta mais antigo, e só some quando todos forem
   reconhecidos.
3. A faixa e o alerta continuam depois de recarregar a página, sair e entrar de novo ou entrar com
   outro usuário, porque o estado fica no servidor.
4. O alerta grave sem reconhecimento fica no topo da lista de alertas.

## US04 - Reconhecer um alerta e registrar a providência

1. O reconhecimento exige a providência adotada, em texto.
2. O reconhecimento grava o usuário, a data e a hora e a providência, e o alerta passa a "em
   atendimento".
3. Um alerta só é reconhecido uma vez. A segunda tentativa, mesmo simultânea, é recusada com
   mensagem que informa quem reconheceu e quando.
4. O reconhecimento gera registro no log de atividades.

## US05 - Registrar manualmente uma ocorrência informada por telefone

1. O formulário permite informar categoria, descrição, localização (ponto no mapa e endereço),
   gravidade e órgão responsável. O bairro é calculado pela localização, como na US22.
2. A ocorrência recebe um protocolo único no formato do protótipo (`2026-08-1147`: ano, mês e
   sequência).
3. São gravados o usuário que registrou, a origem "telefone", a situação inicial "aberta" e o
   primeiro registro do histórico da ocorrência.
4. O cadastro é recusado sem categoria, sem gravidade ou sem localização, ou com ponto fora do
   município.
5. A ocorrência pode ser aberta a partir de um alerta, que fica vinculado a ela.
6. O registro gera entrada no log de atividades e a ocorrência aparece no mapa em tempo real.

## Fora destes critérios

Elementos do protótipo que pertencem a outras histórias continuam visíveis e desabilitados com a
marca da sprint: indicadores do painel (US12), camadas e mapa de calor (US27, US14), filtros
(US08), busca (US26), exportar (US25), atualização e encerramento de ocorrência (US06) e alerta
de dispositivo sem comunicação (US07).
