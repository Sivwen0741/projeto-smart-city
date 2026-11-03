# Relatório de conclusão — Sprint 6

Seção 5 da documentação de teste. É preenchida ao longo da execução e fechada no fim. As
subseções sem registro ainda ficam para o fechamento.

## 5.3 Desvios do plano

- **Vocabulário da situação do caso estendido durante a execução (02/11/2026).** O plano previa
  três valores para a situação de um caso no log: passou, falhou e bloqueado. Na rodada 1, 57
  casos "automatizado e manual" tiveram a parte automatizada aprovada, mas a verificação de tela,
  que é manual, ainda não tinha sido executada. Nenhum dos três valores descrevia essa situação:
  "passou" afirmaria uma verificação que não ocorreu, e "bloqueado" indicaria um impedimento que
  não existia. O vocabulário da seção "Formato dos registros da execução" do plano foi completado
  com "pendente (tela)": a parte automatizada passou, e a verificação de tela ainda não foi
  executada. Um plano que não consegue expressar execução parcial está incompleto, e o certo é
  completá-lo, não forçar o log a registrar um resultado que não ocorreu.

## 5.4 Riscos residuais

- **INC-005, data de instalação em formato americano (aberto, severidade baixa).** Num navegador
  com a interface em inglês, o campo "Instalado em" do formulário de dispositivo mostra a data em
  mês/dia/ano. O resto do sistema mostra dia/mês. O `lang="pt-BR"` do documento não muda isso no
  Chrome, e a correção exige trocar o campo nativo por um componente próprio. Em 02/11/2026 isso
  foi julgado mais arriscado que o defeito, a duas semanas da entrega. Efeito: quem usa o
  navegador em inglês pode ler ou digitar a data com dia e mês trocados; com o navegador em
  português, o campo já aparece em dia/mês.
