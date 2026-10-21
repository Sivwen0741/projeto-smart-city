import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import malhaViaria from '../assets/malha-viaria.svg';
import { Aviso } from '../componentes/Aviso';
import { Botao } from '../componentes/Botao';
import { CaixaSelecao } from '../componentes/CaixaSelecao';
import { Campo } from '../componentes/Campo';
import { Marca } from '../componentes/Marca';
import { ErroApi } from '../sessao/api';
import { useSessao } from '../sessao/sessao';
import estilos from './Login.module.css';

export function Login() {
  const { usuario, entrar } = useSessao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [manterConectado, setManterConectado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail funcional e a senha.');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha, manterConectado);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível falar com o servidor. Tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.pagina}>
      <section className={estilos.cena} aria-label="Centro Integrado de Operações Urbanas">
        <img className={estilos.malha} src={malhaViaria} alt="" />
        <div className={estilos.identificacao}>
          <Marca grande />
          <div>
            <div className={estilos.nome}>Centro Integrado de Operações Urbanas</div>
            <div className={estilos.prefeitura}>Prefeitura Municipal de Ponta Grossa</div>
          </div>
        </div>
        <div className={estilos.chamada}>
          <h1>
            Uma cidade não avisa
            <br />
            quando alguma coisa sai do lugar.
          </h1>
          <p>
            Sensores, câmeras, semáforos e estações ambientais espalhados pelos bairros, reunidos em um painel só, com
            alerta na tela antes que o telefone toque.
          </p>
        </div>
        <div className={estilos.medidas}>
          <div className={estilos.medida}>
            <strong className="numero">137</strong>
            <span>dispositivos em campo</span>
          </div>
          <div className={estilos.medida}>
            <strong className="numero">6</strong>
            <span>órgãos integrados</span>
          </div>
          <div className={estilos.medida}>
            <strong className="numero">24 h</strong>
            <span>plantão ininterrupto</span>
          </div>
        </div>
      </section>

      <main className={estilos.acesso}>
        <form className={estilos.formulario} onSubmit={enviar} noValidate>
          <h2>Entrar na plataforma</h2>
          <p className={estilos.orientacao}>
            Use o e-mail funcional da prefeitura. O que você enxerga depende do órgão em que está lotado.
          </p>
          <div className={estilos.campos}>
            <Campo
              rotulo="E-mail funcional"
              type="email"
              autoComplete="username"
              grande
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Campo
              rotulo="Senha"
              type="password"
              autoComplete="current-password"
              grande
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <CaixaSelecao
            className={estilos.manter}
            rotulo="Manter conectado neste computador"
            checked={manterConectado}
            onChange={(e) => setManterConectado(e.target.checked)}
          />
          {erro && (
            <div className={estilos.aviso}>
              <Aviso>{erro}</Aviso>
            </div>
          )}
          <Botao
            type="submit"
            variante="primario"
            grande
            largo
            className={estilos.entrar}
            disabled={enviando}
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </Botao>
          <p className={estilos.rodape}>
            Todo acesso fica registrado no log de atividades. Problemas para entrar, procure o Departamento de Tecnologia
            da Informação no ramal 4120.
          </p>
        </form>
      </main>
    </div>
  );
}
