// MODO DESENVOLVIMENTO - Pular autenticação
export const DEV_MODE = true; // Mude para false em produção

export const mockUser = {
  id: 'dev-user-id',
  email: 'dev@minehub.com',
  user_metadata: {
    role: 'admin',
    name: 'Developer User'
  }
};

export const mockEmpresa = {
  id: 'dev-empresa-id',
  nome: 'Empresa Teste Dev',
  cnpj: '00.000.000/0001-00',
  tipo: 'empresa',
  tipo_tenant: 'empresa' as const,
  created_at: new Date().toISOString()
};

export const mockLicenca = {
  id: 'dev-licenca-id',
  empresa_id: 'dev-empresa-id',
  plano: 'profissional' as const,
  data_fim: '2025-12-31',
  data_inicio: '2025-01-01',
  ativo: true,
  limite_projetos: 50,
  limite_usuarios: 10,
  max_projetos: 50,
  max_usuarios: 10,
  created_at: new Date().toISOString()
};
