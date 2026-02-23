// PÁGINA SIMPLES - SEM DEPENDÊNCIAS
import Link from "next/link";

export default function SimplePage() {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#0c1222', padding: '40px', fontFamily: 'Arial, sans-serif'}}>
      <div style={{maxWidth: '800px', margin: '0 auto'}}>
        <h1 style={{fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '30px', textAlign: 'center'}}>
          🚀 MINEHUB - PÁGINA SIMPLES
        </h1>
        
        <div style={{backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', marginBottom: '30px'}}>
          <h2 style={{color: '#4ade80', fontSize: '24px', marginBottom: '20px'}}>
            ✅ Funcionalidades Testadas
          </h2>
          <ul style={{color: '#cbd5e1', fontSize: '18px', lineHeight: '1.8', paddingLeft: '20px'}}>
            <li style={{marginBottom: '10px'}}>✅ Página de signup com CSS inline funcionando</li>
            <li style={{marginBottom: '10px'}}>✅ Modo desenvolvimento configurado</li>
            <li style={{marginBottom: '10px'}}>✅ Dados mock criados</li>
            <li style={{marginBottom: '10px'}}>✅ Página simples sem dependências</li>
          </ul>
        </div>

        <div style={{backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', marginBottom: '30px'}}>
          <h2 style={{color: '#4ade80', fontSize: '24px', marginBottom: '20px'}}>
            🔗 Links de Navegação
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <a 
              href="/signup" 
              style={{
                padding: '20px 30px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '18px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              📝 Cadastrar
            </a>
            <a 
              href="/login" 
              style={{
                padding: '20px 30px',
                backgroundColor: '#6b7280',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '18px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
            >
              🔐 Entrar
            </a>
          </div>
        </div>

        <div style={{backgroundColor: '#374151', padding: '30px', borderRadius: '12px'}}>
          <h2 style={{color: '#fbbf24', fontSize: '20px', marginBottom: '15px'}}>
            📋 Próximos Passos
          </h2>
          <ol style={{color: '#f87171', fontSize: '16px', lineHeight: '1.8', paddingLeft: '20px'}}>
            <li style={{marginBottom: '10px'}}>
              <strong>1.</strong> Testar todas as páginas individualmente
            </li>
            <li style={{marginBottom: '10px'}}>
              <strong>2.</strong> Verificar se os dados funcionam localmente
            </li>
            <li style={{marginBottom: '10px'}}>
              <strong>3.</strong> Fazer deploy no Vercel
            </li>
            <li style={{marginBottom: '10px'}}>
              <strong>4.</strong> Configurar domínio personalizado
            </li>
          </ol>
        </div>

        <div style={{marginTop: '40px', textAlign: 'center'}}>
          <p style={{color: '#6b7280', fontSize: '14px'}}>
            ⚡ <strong>Status:</strong> Ambiente de desenvolvimento funcionando
          </p>
        </div>
      </div>
    </div>
  );
}
