"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardDevPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login-dev");
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  if (!isLoggedIn) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0c1222'}}>
        <p style={{color: '#cbd5e1'}}>Verificando acesso...</p>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#0c1222', padding: '20px'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px'}}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#4ade80'}}>
            🚀 MineHub Dashboard (DEV)
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              router.push("/login-dev");
            }}
            style={{padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}
          >
            Sair
          </button>
        </header>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
          <div style={{backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px'}}>
            <h2 style={{color: '#4ade80', fontSize: '18px', marginBottom: '15px'}}>📋 Projetos</h2>
            <p style={{color: '#cbd5e1', marginBottom: '10px'}}>Gerencie seus projetos de mineração</p>
            <button style={{padding: '10px 15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              Ver Projetos
            </button>
          </div>

          <div style={{backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px'}}>
            <h2 style={{color: '#4ade80', fontSize: '18px', marginBottom: '15px'}}>⛏ Extração</h2>
            <p style={{color: '#cbd5e1', marginBottom: '10px'}}>Registre dados de extração</p>
            <button style={{padding: '10px 15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              Ver Extração
            </button>
          </div>

          <div style={{backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px'}}>
            <h2 style={{color: '#4ade80', fontSize: '18px', marginBottom: '15px'}}>💰 Financeiro</h2>
            <p style={{color: '#cbd5e1', marginBottom: '10px'}}>Contas a pagar e receber</p>
            <button style={{padding: '10px 15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              Ver Financeiro
            </button>
          </div>
        </div>

        <div style={{marginTop: '30px', padding: '20px', backgroundColor: '#374151', borderRadius: '8px'}}>
          <p style={{color: '#fbbf24', fontSize: '14px', textAlign: 'center'}}>
            🔧 <strong>MODO DESENVOLVIMENTO</strong> - Funcionalidade básica sem Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
