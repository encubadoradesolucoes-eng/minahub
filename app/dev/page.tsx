// PÁGINA DE DESENVOLVIMENTO - ACESSO DIRETO
"use client";

import { useEffect } from "react";
import { getLicencaStatus } from "@/lib/saas";
import type { LicencaStatus } from "@/lib/saas";

export default async function DevPage() {
  const status: LicencaStatus = await getLicencaStatus();

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#0c1222', padding: '20px'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        <h1 style={{fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '30px', textAlign: 'center'}}>
          🚀 MODO DESENVOLVIMENTO - MINEHUB
        </h1>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px'}}>
          <div style={{backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px'}}>
            <h2 style={{color: '#4ade80', fontSize: '20px', marginBottom: '15px'}}>
              🏢 Empresa Mock
            </h2>
            <div style={{color: '#cbd5e1', lineHeight: '1.6'}}>
              <p><strong>Nome:</strong> Empresa Teste Dev</p>
              <p><strong>CNPJ:</strong> 00.000.000/0001-00</p>
              <p><strong>Tipo:</strong> Empresa</p>
              <p><strong>ID:</strong> dev-empresa-id</p>
            </div>
          </div>

          <div style={{backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px'}}>
            <h2 style={{color: '#4ade80', fontSize: '20px', marginBottom: '15px'}}>
              📜 Licença Mock
            </h2>
            <div style={{color: '#cbd5e1', lineHeight: '1.6'}}>
              <p><strong>Plano:</strong> Profissional</p>
              <p><strong>Válido até:</strong> 31/12/2025</p>
              <p><strong>Status:</strong> ✅ Ativa</p>
              <p><strong>Limite projetos:</strong> 50</p>
              <p><strong>Limite usuários:</strong> 10</p>
            </div>
          </div>
        </div>

        <div style={{backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '30px'}}>
          <h2 style={{color: '#4ade80', fontSize: '20px', marginBottom: '15px'}}>
            🧪 Acesso Rápido (Sem Tailwind)
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
            <a 
              href="/dashboard/projetos" 
              style={{
                padding: '15px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                display: 'block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              📋 Projetos
            </a>
            <a 
              href="/dashboard/extracao" 
              style={{
                padding: '15px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                display: 'block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              ⛏ Extração
            </a>
            <a 
              href="/dashboard/equipamentos" 
              style={{
                padding: '15px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                display: 'block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              🔧 Equipamentos
            </a>
            <a 
              href="/dashboard/contas-pagar" 
              style={{
                padding: '15px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                display: 'block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              💸 Contas a Pagar
            </a>
            <a 
              href="/dashboard/contas-receber" 
              style={{
                padding: '15px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                display: 'block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              💰 Contas a Receber
            </a>
            <a 
              href="/dashboard/financiamentos" 
              style={{
                padding: '15px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                display: 'block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              🏦 Financiamentos
            </a>
          </div>
        </div>

        <div style={{marginTop: '30px', padding: '20px', backgroundColor: '#374151', borderRadius: '8px'}}>
          <p style={{color: '#fbbf24', fontSize: '16px', textAlign: 'center', lineHeight: '1.6'}}>
            ⚠️ <strong>PÁGINA DE DESENVOLVIMENTO</strong><br /><br />
            Esta página usa CSS inline e modo mock para testar funcionalidades.<br /><br />
            Para produção:<br />
            1. Mude <code style={{backgroundColor: '#1f2937', padding: '4px 8px', borderRadius: '4px', color: '#fbbf24'}}>DEV_MODE = false</code><br />
            2. Em <code style={{backgroundColor: '#1f2937', padding: '4px 8px', borderRadius: '4px', color: '#fbbf24'}}>lib/dev-mode.ts</code><br />
            3. Use Tailwind CSS normalmente
          </p>
        </div>
      </div>
    </div>
  );
}
