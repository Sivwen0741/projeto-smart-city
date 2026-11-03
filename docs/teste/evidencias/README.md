# Evidências da execução dos testes

Evidências da seção 3 (log de execução) da documentação de teste da Sprint 6, no formato da seção
"Formato dos registros da execução" do plano de teste. O log por caso está em
[`../log-de-execucao.md`](../log-de-execucao.md) e os incidentes em
[`../incidentes.md`](../incidentes.md).

**Uma pasta por rodada:** `AAAA-MM-DD-rodada-N/`, por exemplo `2026-11-02-rodada-1/`. Dentro dela:

- **Saída da suíte automatizada:** `unidade.txt` e `integracao.txt`, mais `smoke.txt` com o smoke
  test que abre a rodada. Cada arquivo começa com a data, a hora, a versão e o comando usado.
- **Saída do Newman:** `newman.txt`.
- **Captura de tela de caso manual:** uma por caso, nomeada pelo identificador do caso
  (`CT-034.png`). Quando o caso precisa de mais de uma captura, numere na ordem dos passos:
  `CT-049-1.png`, `CT-049-2.png` e assim por diante.

**Reteste de incidente:** pasta própria, `AAAA-MM-DD-reteste-INC-NNN/`, com a versão corrigida
identificada pelo commit.

## Preparação de dados para os casos manuais

Os comandos valem para o ambiente da versão sob teste, no clone da tag. Como esse clone sobe com o
nome de projeto `teste-sprint-6`, todo comando do Compose leva `-p teste-sprint-6` e roda dentro da
pasta do clone.

**Leitura de dispositivo pelo MQTT.** Mesmo formato do README do projeto:

```sh
docker compose -p teste-sprint-6 exec mosquitto mosquitto_pub -q 1 -t scoc/dispositivos/SN-027/leituras \
  -m '{"leituras": [{"grandeza": "nivel_agua", "valor": 2.4}]}'
```

Cada dispositivo só aceita as grandezas do seu tipo. A EA-02, por exemplo, aceita `temperatura` e
`precipitacao`, mas não `umidade`. Mensagem com grandeza que o tipo não mede é descartada inteira.

**Alerta de poluição por bairro (CT-127 e CT-128).** Não há comando MQTT para este alerta. Ele não
vem de dispositivo: é aberto pela coleta do Open-Meteo Air Quality API, que roda 10 s depois da
subida da interface de programação e depois a cada 60 min. A coleta avalia a regra "Material
particulado elevado" (PM2.5 acima de 55 µg/m³), e o PM2.5 real de Ponta Grossa costuma ficar bem
abaixo disso. Para provocar o alerta:

1. Ver o valor atual de PM2.5 dos bairros (em 02/11/2026, 8,6 µg/m³ em todos, porque a grade do
   Open-Meteo é maior que os bairros):

   ```sh
   docker compose -p teste-sprint-6 exec db psql -U scoc -d scoc -c \
     "SELECT b.nome, l.valor, l.data_hora FROM leitura l JOIN bairro b ON b.id = l.bairro_id
       WHERE l.tipo_grandeza = 'pm25' AND l.data_hora <= now() ORDER BY l.data_hora DESC, l.valor DESC LIMIT 16"
   ```

2. Na tela, em Regras › Material particulado elevado, trocar o valor limite para um número abaixo
   do valor atual (por exemplo, 5) e salvar.
3. Forçar uma coleta reiniciando a interface de programação, e esperar cerca de 30 s:

   ```sh
   docker compose -p teste-sprint-6 restart api
   ```

   Abre um alerta "Material particulado elevado" para cada bairro acima do novo limite: sem
   dispositivo, com "Open-Meteo", o bairro, a fonte "Open-Meteo Air Quality API" e o Meio Ambiente
   como órgão sugerido. Com o mesmo valor em todos os bairros, são 16 alertas.
4. Depois dos casos, voltar o valor limite da regra para 55. A alteração e a volta ficam no histórico
   da regra.

A troca do limite também vale para a EA-03, que mede PM2.5. Como a regra exige 60 min acima do
limite, ela pode abrir também um alerta de dispositivo da mesma regra. No CT-127, o alerta a abrir é
o que mostra "Open-Meteo" no lugar do dispositivo.
