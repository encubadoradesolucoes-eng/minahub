"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginDevPage() {
  const [email, setEmail] = useState("dev@minehub.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    
    // CREDENCIAIS HARDCODED - MODO DEV
    if (email === "dev@minehub.com" && password === "123456") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      router.push("/dashboard");
      return;
    }
    
    setError("Credenciais inválidas. Use: dev@minehub.com / 123456");
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0c1222', padding: '20px'}}>
      <div style={{width: '100%', maxWidth: '400px'}}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', color: '#4ade80', marginBottom: '10px'}}>
            MineHub
          </h1>
          <p style={{color: '#cbd5e1'}}>Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div>
            <label style={{display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px'}}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px'}}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{color: '#f87171', fontSize: '14px', textAlign: 'center', padding: '10px', backgroundColor: '#1f2937', borderRadius: '6px'}}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: '14px 20px',
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          >
            Entrar
          </button>
        </form>

        <div style={{marginTop: '30px', textAlign: 'center'}}>
          <p style={{color: '#cbd5e1', fontSize: '14px'}}>
            Não tem conta?{" "}
            <Link href="/signup" style={{color: '#4ade80', textDecoration: 'underline'}}>
              Cadastre-se
            </Link>
          </p>
        </div>

        <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#374151', borderRadius: '8px'}}>
          <p style={{color: '#fbbf24', fontSize: '12px', textAlign: 'center', lineHeight: '1.4'}}>
            <strong>🔧 MODO DESENVOLVIMENTO</strong><br />
            Use as credenciais:<br />
            <strong>Email:</strong> dev@minehub.com<br />
            <strong>Senha:</strong> 123456
          </p>
        </div>
      </div>
    </div>
  );
}
