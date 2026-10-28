import { SetMetadata } from '@nestjs/common';

export const PERMISSOES = ['consultar', 'operar', 'configurar', 'administrar'] as const;
export type Permissao = (typeof PERMISSOES)[number];

export const PERMISSAO_EXIGIDA = 'permissaoExigida';

// sem o decorador, leitura exige consultar e escrita exige operar (ver jwt.guard)
export const Exige = (permissao: Permissao) => SetMetadata(PERMISSAO_EXIGIDA, permissao);
