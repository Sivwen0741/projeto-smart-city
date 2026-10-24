import { INestApplication } from '@nestjs/common';
import { randomBytes } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { preparar } from '../src/database/preparar';
import { criarApp, criarUsuario, entrar, UsuarioDeTeste } from './apoio';

interface Ponto {
  latitude: number;
  longitude: number;
}

describe('US22 - Cadastrar, editar e inativar dispositivos com localização geográfica', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let usuario: UsuarioDeTeste;
  let token: string;
  let tipos: Record<string, string>;
  let olarias: Ponto & { bairroId: string };
  let outroBairro: Ponto & { bairroId: string; nome: string };
  let zonaRural: Ponto;
  const curitiba: Ponto = { latitude: -25.4284, longitude: -49.2733 };
  const lote = randomBytes(3).toString('hex').toUpperCase();
  let sequencia = 0;

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const codigo = (prefixo = 'T') => `${prefixo}-${lote}-${++sequencia}`;

  async function pontoDoBairro(filtro: string, parametros: unknown[] = []) {
    const [linha] = await fonte.query(
      `SELECT id::text AS "bairroId", nome, ST_Y(p) AS latitude, ST_X(p) AS longitude
         FROM (SELECT id, nome, ST_PointOnSurface(area) AS p FROM bairro WHERE ${filtro} ORDER BY id LIMIT 1) b`,
      parametros,
    );
    return linha;
  }

  function sensor(extra: object = {}) {
    return {
      identificador: codigo('SN'),
      tipoDispositivoId: tipos['Sensor de nível'],
      descricao: 'Arroio Olarias, sob a ponte da Av. Visconde de Taunay',
      endereco: 'Av. Visconde de Taunay, ponte do Arroio Olarias',
      latitude: olarias.latitude,
      longitude: olarias.longitude,
      dataInstalacao: '2024-03-14',
      estado: 'ativo',
      atributos: { tipoGrandeza: 'nivel_agua', unidadeMedida: 'm', intervaloLeituraSegundos: 30 },
      ...extra,
    };
  }

  async function cadastrar(dados: Record<string, unknown> = sensor()) {
    return (await autenticado(http().post('/api/dispositivos')).send(dados).expect(201)).body;
  }

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    usuario = await criarUsuario(fonte);
    token = await entrar(app, usuario);
    const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    tipos = Object.fromEntries(lista.map((t: { nome: string; id: string }) => [t.nome, t.id]));
    olarias = await pontoDoBairro(`nome = 'Olarias'`);
    outroBairro = await pontoDoBairro(`nome <> 'Olarias'`);
    [zonaRural] = await fonte.query(
      `SELECT ST_Y(p) AS latitude, ST_X(p) AS longitude
         FROM (SELECT ST_PointOnSurface(area) AS p FROM distrito WHERE nome = 'Itaiacoca') d
        WHERE NOT EXISTS (SELECT 1 FROM bairro WHERE ST_Contains(area, p))`,
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US22-1 o formulário recebe código, tipo, descrição, bairro, endereço, coordenada, data de instalação e situação', () => {
    it('US22-1 cadastra com todos os campos e devolve cada um deles', async () => {
      const dados = sensor();
      const criado = await cadastrar(dados);
      expect(criado).toMatchObject({
        identificador: dados.identificador,
        tipoDispositivoId: tipos['Sensor de nível'],
        tipo: 'Sensor de nível',
        descricao: dados.descricao,
        endereco: dados.endereco,
        bairro: 'Olarias',
        dataInstalacao: '2024-03-14',
        estado: 'ativo',
      });
      expect(criado.latitude).toBeCloseTo(dados.latitude, 6);
      expect(criado.longitude).toBeCloseTo(dados.longitude, 6);
      const lido = (await autenticado(http().get(`/api/dispositivos/${criado.id}`)).expect(200)).body;
      expect(lido).toEqual(criado);
    });

    it('US22-1 a situação pode ser cadastrada como manutenção ou inativo', async () => {
      for (const estado of ['manutencao', 'inativo']) {
        expect((await cadastrar(sensor({ estado }))).estado).toBe(estado);
      }
    });

    it('US22-1 recusa cadastro sem código, sem tipo ou com coordenada inválida', async () => {
      const casos = [
        sensor({ identificador: '' }),
        sensor({ tipoDispositivoId: undefined }),
        sensor({ latitude: 91 }),
        sensor({ longitude: 'abc' }),
        sensor({ estado: 'operando' }),
        sensor({ dataInstalacao: '14/03/2024' }),
      ];
      for (const dados of casos) {
        await autenticado(http().post('/api/dispositivos')).send(dados).expect(400);
      }
    });

    it('US22-1 recusa tipo inexistente', async () => {
      const resposta = await autenticado(http().post('/api/dispositivos')).send(sensor({ tipoDispositivoId: '999999' })).expect(400);
      expect(resposta.body.message).toContain('Tipo de dispositivo inexistente.');
    });

    it('US22-1 cadastro sem token é recusado', async () => {
      await http().post('/api/dispositivos').send(sensor()).expect(401);
    });
  });

  describe('US22-2 o código identificador é único e a repetição é recusada indicando o conflito', () => {
    it('US22-2 código repetido, mesmo com outra caixa, é recusado com 409 e a mensagem cita o existente', async () => {
      const existente = await cadastrar();
      const resposta = await autenticado(http().post('/api/dispositivos'))
        .send(sensor({ identificador: existente.identificador.toLowerCase() }))
        .expect(409);
      expect(resposta.body.message).toBe(
        `O código ${existente.identificador} já está cadastrado (Sensor de nível, Olarias). Informe outro código.`,
      );
    });

    it('US22-2 editar para o código de outro dispositivo também é recusado', async () => {
      const primeiro = await cadastrar();
      const segundo = await cadastrar();
      await autenticado(http().patch(`/api/dispositivos/${segundo.id}`)).send({ identificador: primeiro.identificador }).expect(409);
    });

    it('US22-2 dois cadastros simultâneos com o mesmo código: só um é aceito', async () => {
      const dados = sensor();
      const respostas = await Promise.all([1, 2, 3].map(() => autenticado(http().post('/api/dispositivos')).send(dados)));
      expect(respostas.map((r) => r.status).sort()).toEqual([201, 409, 409]);
    });
  });

  describe('US22-3 a coordenada é geography e o bairro sai de consulta espacial', () => {
    it('US22-3 a coluna localizacao é geography(Point,4326)', async () => {
      const [{ tipo }] = await fonte.query(
        `SELECT format_type(atttypid, atttypmod) AS tipo FROM pg_attribute
          WHERE attrelid = 'dispositivo'::regclass AND attname = 'localizacao'`,
      );
      expect(tipo).toBe('geography(Point,4326)');
    });

    it('US22-3 o bairro gravado é o que contém a coordenada', async () => {
      const criado = await cadastrar();
      const [{ bairro_id, contem }] = await fonte.query(
        `SELECT d.bairro_id::text AS bairro_id, ST_Contains(b.area, d.localizacao::geometry) AS contem
           FROM dispositivo d JOIN bairro b ON b.id = d.bairro_id WHERE d.id = $1`,
        [criado.id],
      );
      expect(bairro_id).toBe(olarias.bairroId);
      expect(contem).toBe(true);
    });

    it('US22-3 o bairro não pode ser digitado', async () => {
      await autenticado(http().post('/api/dispositivos')).send(sensor({ bairroId: outroBairro.bairroId })).expect(400);
    });

    it('US22-3 mudar a coordenada recalcula o bairro', async () => {
      const criado = await cadastrar();
      const editado = (
        await autenticado(http().patch(`/api/dispositivos/${criado.id}`))
          .send({ latitude: outroBairro.latitude, longitude: outroBairro.longitude })
          .expect(200)
      ).body;
      expect(editado.bairroId).toBe(outroBairro.bairroId);
      expect(editado.bairro).toBe(outroBairro.nome);
    });

    it('US22-3 ponto na zona rural fica sem bairro e com o distrito calculado', async () => {
      const criado = await cadastrar(sensor(zonaRural));
      expect(criado.bairroId).toBeNull();
      expect(criado.distrito).toBe('Itaiacoca');
    });

    it('US22-3 ponto fora do município é recusado', async () => {
      const resposta = await autenticado(http().post('/api/dispositivos')).send(sensor(curitiba)).expect(422);
      expect(resposta.body.message).toBe('A coordenada está fora do município de Ponta Grossa.');
    });

    it('US22-3 a consulta de localização devolve bairro e distrito antes de salvar', async () => {
      const local = (
        await autenticado(http().get('/api/territorio/localizar')).query({ latitude: olarias.latitude, longitude: olarias.longitude }).expect(200)
      ).body;
      expect(local).toEqual({ bairroId: olarias.bairroId, bairro: 'Olarias', distrito: 'Ponta Grossa' });
      await autenticado(http().get('/api/territorio/localizar')).query(curitiba).expect(422);
    });
  });

  describe('US22-4 os atributos de cada tipo vão para o campo jsonb da tabela única', () => {
    it('US22-4 cada tipo grava os próprios atributos em atributos_especificos', async () => {
      const casos: [string, Record<string, unknown>][] = [
        ['Sensor de tráfego', { tipoGrandeza: 'velocidade_media', unidadeMedida: 'km/h', intervaloLeituraSegundos: 60 }],
        ['Câmera', { modelo: 'PTZ 4K', resolucao: '3840x2160', anguloVisao: 110 }],
        ['Semáforo inteligente', { tempoCicloSegundos: 92, modoOperacao: 'atuado' }],
        ['Estação ambiental', { fabricante: 'Fabricante de teste', variaveisMonitoradas: ['pm25', 'temperatura'] }],
        ['Controlador de iluminação', { quantidadePontos: 9 }],
      ];
      for (const [tipo, atributos] of casos) {
        const criado = await cadastrar(sensor({ tipoDispositivoId: tipos[tipo], atributos }));
        const [{ atributos_especificos, tipo_coluna }] = await fonte.query(
          `SELECT atributos_especificos, pg_typeof(atributos_especificos)::text AS tipo_coluna FROM dispositivo WHERE id = $1`,
          [criado.id],
        );
        expect(tipo_coluna).toBe('jsonb');
        expect(atributos_especificos).toEqual(atributos);
      }
    });

    it('US22-4 os tipos expõem os campos próprios, inclusive os do controlador de iluminação definidos no DT01', async () => {
      const lista = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
      const porNome = Object.fromEntries(lista.map((t: { nome: string }) => [t.nome, t]));
      expect(porNome['Câmera'].campos.map((c: { nome: string }) => c.nome)).toEqual(['modelo', 'resolucao', 'anguloVisao']);
      const controlador = porNome['Controlador de iluminação'];
      expect(controlador.campos.map((c: { nome: string; obrigatorio: boolean }) => [c.nome, c.obrigatorio])).toEqual([
        ['quantidadePontos', true],
        ['intervaloLeituraSegundos', false],
      ]);
      expect(controlador.intervaloLeituraSegundos).toBe(30);
      await autenticado(http().post('/api/dispositivos')).send(sensor({ tipoDispositivoId: tipos['Controlador de iluminação'], atributos: {} })).expect(400);
      const grandezas = (await autenticado(http().get('/api/grandezas')).expect(200)).body;
      expect(grandezas).toContainEqual({ codigo: 'nivel_agua', rotulo: 'Nível de água', unidade: 'm' });
    });

    it('US22-4 atributo de outro tipo, valor inválido ou obrigatório ausente é recusado', async () => {
      const casos = [
        sensor({ atributos: { tipoGrandeza: 'nivel_agua', modelo: 'PTZ' } }),
        sensor({ atributos: { tipoGrandeza: 'nivel_agua', intervaloLeituraSegundos: -5 } }),
        sensor({ atributos: { tipoGrandeza: 'grandeza_inexistente' } }),
        sensor({ atributos: { unidadeMedida: 'm' } }),
        sensor({ tipoDispositivoId: tipos['Câmera'], atributos: { anguloVisao: 400 } }),
      ];
      for (const dados of casos) {
        await autenticado(http().post('/api/dispositivos')).send(dados).expect(400);
      }
    });

    it('US22-4 trocar o tipo exige atributos compatíveis com o novo tipo', async () => {
      const criado = await cadastrar();
      await autenticado(http().patch(`/api/dispositivos/${criado.id}`)).send({ tipoDispositivoId: tipos['Câmera'] }).expect(400);
      const editado = (
        await autenticado(http().patch(`/api/dispositivos/${criado.id}`))
          .send({ tipoDispositivoId: tipos['Câmera'], atributos: { modelo: 'PTZ' } })
          .expect(200)
      ).body;
      expect(editado.atributos).toEqual({ modelo: 'PTZ' });
    });
  });

  describe('US22-5 dispositivo não é excluído, só inativado, e as leituras continuam acessíveis', () => {
    it('US22-5 não existe rota de exclusão', async () => {
      const criado = await cadastrar();
      await autenticado(http().delete(`/api/dispositivos/${criado.id}`)).expect(404);
      await autenticado(http().get(`/api/dispositivos/${criado.id}`)).expect(200);
    });

    it('US22-5 inativar mantém o registro e o histórico de leituras', async () => {
      const criado = await cadastrar();
      await fonte.query(
        `INSERT INTO leitura (dispositivo_id, tipo_grandeza, valor, unidade, origem, data_hora)
         VALUES ($1, 'nivel_agua', 3.81, 'm', 'mqtt', now() - interval '1 hour'), ($1, 'nivel_agua', 3.47, 'm', 'mqtt', now() - interval '2 hours')`,
        [criado.id],
      );
      const inativado = (
        await autenticado(http().patch(`/api/dispositivos/${criado.id}`)).send({ estado: 'inativo' }).expect(200)
      ).body;
      expect(inativado).toMatchObject({ estado: 'inativo', situacao: 'inativo' });

      const leituras = (await autenticado(http().get(`/api/dispositivos/${criado.id}/leituras`)).expect(200)).body;
      expect(leituras.map((l: { valor: number }) => l.valor)).toEqual([3.81, 3.47]);
      const lista = (await autenticado(http().get('/api/dispositivos')).expect(200)).body;
      expect(lista.find((d: { id: string }) => d.id === criado.id)?.estado).toBe('inativo');
    });

    it('US22-5 dispositivo inexistente responde 404', async () => {
      await autenticado(http().get('/api/dispositivos/999999999/leituras')).expect(404);
      await autenticado(http().patch('/api/dispositivos/999999999')).send({ estado: 'inativo' }).expect(404);
    });
  });

  describe('US22-6 a listagem mostra código, tipo, localização, situação e última comunicação, ordenáveis', () => {
    const prefixo = `ORD${lote}`;
    let ids: Record<string, string>;

    beforeAll(async () => {
      const a = await cadastrar(sensor({ identificador: `${prefixo}-A`, tipoDispositivoId: tipos['Sensor de ruído'], atributos: { tipoGrandeza: 'nivel_sonoro' } }));
      const b = await cadastrar(sensor({ identificador: `${prefixo}-B`, tipoDispositivoId: tipos['Câmera'], atributos: {}, estado: 'manutencao', latitude: outroBairro.latitude, longitude: outroBairro.longitude }));
      const c = await cadastrar(sensor({ identificador: `${prefixo}-C`, tipoDispositivoId: tipos['Semáforo inteligente'], atributos: {}, endereco: 'Rua Visconde de Mauá, 900' }));
      await fonte.query(`UPDATE dispositivo SET ultima_comunicacao = now() - interval '5 seconds' WHERE id = $1`, [a.id]);
      await fonte.query(`UPDATE dispositivo SET ultima_comunicacao = now() - interval '2 minutes' WHERE id = $1`, [b.id]);
      await fonte.query(`UPDATE dispositivo SET ultima_comunicacao = now() - interval '2 hours' WHERE id = $1`, [c.id]);
      ids = { A: a.id, B: b.id, C: c.id };
    });

    async function ordem(parametros: Record<string, string>) {
      const lista = (await autenticado(http().get('/api/dispositivos')).query(parametros).expect(200)).body;
      return lista.filter((d: { identificador: string }) => d.identificador.startsWith(prefixo)).map((d: { identificador: string }) => d.identificador.slice(-1)).join('');
    }

    it('US22-6 cada item traz as colunas da listagem', async () => {
      const lista = (await autenticado(http().get('/api/dispositivos')).expect(200)).body;
      const item = lista.find((d: { id: string }) => d.id === ids.A);
      expect(item).toMatchObject({ identificador: `${prefixo}-A`, tipo: 'Sensor de ruído', bairro: 'Olarias', situacao: 'operando' });
      expect(item.endereco).toBeTruthy();
      expect(new Date(item.ultimaComunicacao).getTime()).toBeLessThan(Date.now());
    });

    it('US22-6 ordena por código, tipo, localização, situação e comunicação, nos dois sentidos', async () => {
      const [{ antes }] = await fonte.query(`SELECT $1::text < 'Olarias' AS antes`, [outroBairro.nome]);
      const esperadoLocal = antes ? 'BAC' : 'ACB';
      const casos: [string, string][] = [
        ['codigo', 'ABC'],
        ['tipo', 'BCA'],
        ['localizacao', esperadoLocal],
        ['situacao', 'ACB'],
        ['comunicacao', 'ABC'],
      ];
      for (const [campo, esperado] of casos) {
        expect(`${campo} ${await ordem({ ordem: campo, direcao: 'asc' })}`).toBe(`${campo} ${esperado}`);
        expect(`${campo} ${await ordem({ ordem: campo, direcao: 'desc' })}`).toBe(`${campo} ${[...esperado].reverse().join('')}`);
      }
    });

    it('US22-6 ordenação desconhecida é recusada', async () => {
      await autenticado(http().get('/api/dispositivos')).query({ ordem: 'senha' }).expect(400);
    });
  });

  it('US22-6 sem comunicação passa de duas vezes o intervalo do dispositivo, do tipo ou, sem nenhum, de 30 minutos', async () => {
    const [{ id: semIntervalo }] = await fonte.query(
      `INSERT INTO tipo_dispositivo (nome, categoria) VALUES ('Câmera sem intervalo de teste', 'camera_monitoramento')
       ON CONFLICT (nome) DO UPDATE SET intervalo_leitura_segundos = NULL RETURNING id::text`,
    );
    const casos: [Record<string, unknown>, number][] = [
      [sensor({ atributos: { tipoGrandeza: 'nivel_agua', intervaloLeituraSegundos: 10 } }), 20],
      [sensor({ atributos: { tipoGrandeza: 'nivel_agua' } }), 60],
      [sensor({ tipoDispositivoId: semIntervalo, atributos: {} }), 1800],
    ];
    for (const [dados, limite] of casos) {
      const criado = await cadastrar(dados);
      expect(criado.situacao).toBe('sem_comunicacao');
      expect(criado.limiteComunicacaoSegundos).toBe(limite);
      for (const [segundos, situacao] of [
        [limite - 5, 'operando'],
        [limite + 5, 'sem_comunicacao'],
      ] as const) {
        await fonte.query(`UPDATE dispositivo SET ultima_comunicacao = now() - $2 * interval '1 second' WHERE id = $1`, [criado.id, segundos]);
        const lido = (await autenticado(http().get(`/api/dispositivos/${criado.id}`)).expect(200)).body;
        expect(`${limite} ${segundos} ${lido.situacao}`).toBe(`${limite} ${segundos} ${situacao}`);
      }
    }
  });

  it('US22-6 a subida não renova a última comunicação dos exemplos: só a ingestão a atualiza', async () => {
    await fonte.query(`UPDATE dispositivo SET ultima_comunicacao = now() - interval '1 day' WHERE identificador IN ('SN-014', 'EA-07', 'IL-118')`);
    await preparar(fonte);
    const linhas = await fonte.query(
      `SELECT identificador, now() - ultima_comunicacao < interval '1 minute' AS recente FROM dispositivo
        WHERE identificador IN ('SN-014', 'EA-07', 'IL-118') ORDER BY identificador`,
    );
    expect(linhas).toEqual([
      { identificador: 'EA-07', recente: false },
      { identificador: 'IL-118', recente: false },
      { identificador: 'SN-014', recente: false },
    ]);
    const situacoes = (await autenticado(http().get('/api/dispositivos')).expect(200)).body
      .filter((d: { identificador: string }) => ['SN-014', 'EA-07', 'IL-118', 'SN-019'].includes(d.identificador))
      .map((d: { identificador: string; situacao: string }) => `${d.identificador} ${d.situacao}`);
    expect(situacoes).toEqual(['EA-07 sem_comunicacao', 'IL-118 manutencao', 'SN-014 sem_comunicacao', 'SN-019 inativo']);
  });

  describe('US22-7 criação, edição e inativação geram registro no log com o autor', () => {
    async function registros(id: string) {
      return fonte.query(
        `SELECT acao, usuario_id::text AS usuario_id, detalhes FROM log_atividade
          WHERE entidade_afetada = 'dispositivo' AND entidade_id = $1 ORDER BY id`,
        [id],
      );
    }

    it('US22-7 registra cadastro, edição e inativação com autor e valores anterior e novo', async () => {
      const criado = await cadastrar();
      await autenticado(http().patch(`/api/dispositivos/${criado.id}`)).send({ endereco: 'Rua Nova, 10' }).expect(200);
      await autenticado(http().patch(`/api/dispositivos/${criado.id}`)).send({ estado: 'inativo' }).expect(200);

      const log = await registros(criado.id);
      expect(log.map((r: { acao: string }) => r.acao)).toEqual(['cadastro_dispositivo', 'edicao_dispositivo', 'inativacao_dispositivo']);
      expect(log.every((r: { usuario_id: string }) => r.usuario_id === usuario.id)).toBe(true);
      expect(log[0].detalhes.depois.identificador).toBe(criado.identificador);
      expect(log[1].detalhes).toEqual({ antes: { endereco: criado.endereco }, depois: { endereco: 'Rua Nova, 10' } });
      expect(log[2].detalhes).toEqual({ antes: { estado: 'ativo' }, depois: { estado: 'inativo' } });
    });

    it('US22-7 o autor registrado é quem fez a alteração', async () => {
      const outro = await criarUsuario(fonte);
      const tokenOutro = await entrar(app, outro);
      const criado = await cadastrar();
      await http().patch(`/api/dispositivos/${criado.id}`).set('Authorization', `Bearer ${tokenOutro}`).send({ descricao: 'Outra' }).expect(200);
      const log = await registros(criado.id);
      expect(log.map((r: { usuario_id: string }) => r.usuario_id)).toEqual([usuario.id, outro.id]);
    });

    it('US22-7 operação recusada não gera registro', async () => {
      const criado = await cadastrar();
      await autenticado(http().patch(`/api/dispositivos/${criado.id}`)).send({ ...curitiba }).expect(422);
      await autenticado(http().patch(`/api/dispositivos/${criado.id}`)).send({}).expect(200);
      expect((await registros(criado.id)).map((r: { acao: string }) => r.acao)).toEqual(['cadastro_dispositivo']);
    });
  });
});
