import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { criarApp, criarUsuario, entrar } from './apoio';

interface Encontrado {
  id: string;
  bairro: string | null;
}

describe('US26 localizar uma ocorrência pelo protocolo, endereço ou dispositivo', () => {
  let app: INestApplication;
  let fonte: DataSource;
  let token: string;
  let ponto: { latitude: number; longitude: number };
  let marca: string;
  let ocorrencia: { id: string; protocolo: string };
  let dispositivo: { id: string; identificador: string };

  const http = () => request(app.getHttpServer());
  const autenticado = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  const buscar = async (q: string) => (await autenticado(http().get('/api/busca').query({ q })).expect(200)).body;
  const ids = (lista: Encontrado[]) => lista.map((e) => e.id);

  beforeAll(async () => {
    ({ app, fonte } = await criarApp());
    token = await entrar(app, await criarUsuario(fonte));
    [ponto] = await fonte.query(
      `SELECT ST_Y(ST_PointOnSurface(area)) AS latitude, ST_X(ST_PointOnSurface(area)) AS longitude FROM bairro WHERE nome = 'Cará-Cará'`,
    );
    marca = randomUUID().slice(0, 8);
    const orgaos = (await autenticado(http().get('/api/orgaos')).expect(200)).body;
    ocorrencia = (
      await autenticado(http().post('/api/ocorrencias'))
        .send({
          categoria: 'Alagamento',
          criticidade: 'atencao',
          orgaoId: orgaos[0].id,
          descricao: 'Água sobre a calçada.',
          ...ponto,
          endereco: `Rua Ênio Guimarães ${marca}, 120`,
        })
        .expect(201)
    ).body;
    const tipos = (await autenticado(http().get('/api/tipos-dispositivo')).expect(200)).body;
    dispositivo = (
      await autenticado(http().post('/api/dispositivos'))
        .send({
          identificador: `U26-${marca}`,
          tipoDispositivoId: tipos.find((t: { nome: string }) => t.nome === 'Câmera').id,
          ...ponto,
          endereco: `Praça São João ${marca}`,
          estado: 'ativo',
          atributos: { resolucao: '1920x1080' },
        })
        .expect(201)
    ).body;
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('US26-1 a busca procura por protocolo, endereço, bairro e código de dispositivo, a partir de três caracteres', () => {
    it('US26-1 encontra a ocorrência pelo protocolo', async () => {
      expect(ids((await buscar(ocorrencia.protocolo)).ocorrencias)).toContain(ocorrencia.id);
    });

    it('US26-1 encontra a ocorrência e o dispositivo pelo endereço', async () => {
      expect(ids((await buscar(`Ênio Guimarães ${marca}`)).ocorrencias)).toEqual([ocorrencia.id]);
      expect(ids((await buscar(`São João ${marca}`)).dispositivos)).toEqual([dispositivo.id]);
    });

    it('US26-1 encontra pelo bairro', async () => {
      const resultado = await buscar('Cará-Cará');
      expect(ids(resultado.ocorrencias)[0]).toBe(ocorrencia.id);
      expect(resultado.dispositivos.length).toBeGreaterThan(0);
      expect(resultado.dispositivos.every((d: Encontrado) => d.bairro === 'Cará-Cará')).toBe(true);
    });

    it('US26-1 encontra o dispositivo pelo código', async () => {
      const resultado = await buscar(dispositivo.identificador);
      expect(resultado).toMatchObject({ ocorrencias: [], dispositivos: [{ id: dispositivo.id, identificador: dispositivo.identificador, tipo: 'Câmera' }] });
    });

    it('US26-1 recusa menos de três caracteres, sem contar os espaços', async () => {
      await autenticado(http().get('/api/busca').query({ q: 'ab' })).expect(400);
      await autenticado(http().get('/api/busca').query({ q: '  ab  ' })).expect(400);
      await autenticado(http().get('/api/busca')).expect(400);
    });

    it('US26-1 trata % e _ como texto, não como curinga', async () => {
      expect(await buscar('%%%')).toEqual({ ocorrencias: [], dispositivos: [] });
      expect((await buscar('___')).dispositivos).toEqual([]);
    });

    it('US26-1 exige autenticação', async () => {
      await http().get('/api/busca').query({ q: 'centro' }).expect(401);
    });
  });

  describe('US26-2 os resultados vêm agrupados e levam ao detalhe', () => {
    it('US26-2 separa ocorrências e dispositivos, e cada resultado abre o seu detalhe', async () => {
      const resultado = await buscar(marca);
      expect(Object.keys(resultado)).toEqual(['ocorrencias', 'dispositivos']);
      expect(resultado.ocorrencias[0]).toMatchObject({ id: ocorrencia.id, protocolo: ocorrencia.protocolo, categoria: 'Alagamento', situacao: 'aberta', bairro: 'Cará-Cará' });
      expect(resultado.dispositivos[0]).toMatchObject({ id: dispositivo.id, situacao: 'sem_comunicacao', bairro: 'Cará-Cará' });
      await autenticado(http().get(`/api/ocorrencias/${resultado.ocorrencias[0].id}`)).expect(200);
      await autenticado(http().get(`/api/dispositivos/${resultado.dispositivos[0].id}`)).expect(200);
    });
  });

  describe('US26-3 a busca não diferencia maiúsculas nem acentos', () => {
    it('US26-3 sem acento e em maiúsculas encontra o mesmo que o texto original', async () => {
      const original = await buscar(`Ênio Guimarães ${marca}`);
      expect(await buscar(`ENIO GUIMARAES ${marca.toUpperCase()}`)).toEqual(original);
      expect(ids((await buscar(`praca sao joao ${marca}`)).dispositivos)).toEqual([dispositivo.id]);
      expect(ids((await buscar('cara-cara')).dispositivos)).toEqual(ids((await buscar('CARÁ-CARÁ')).dispositivos));
      expect(ids((await buscar(dispositivo.identificador.toLowerCase())).dispositivos)).toEqual([dispositivo.id]);
    });
  });
});
