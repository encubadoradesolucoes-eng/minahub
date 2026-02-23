"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    
    // Para desenvolvimento: criar conta sem confirmação de e-mail
    const { error: err } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          skip_email_verification: true
        }
      }
    });
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    
    // Para desenvolvimento: fazer login automático
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    if (loginErr) {
      setError(loginErr.message);
      return;
    }
    
    setMessage("Conta criada com sucesso!");
    router.push("/dashboard/cadastro-completo");
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', backgroundColor: '#0c1222'}}>
      <div style={{width: '100%', maxWidth: '400px'}}>
        <div style={{textAlign: 'center'}}>
          <Link href="/" style={{fontSize: '24px', fontWeight: 'bold', color: '#4ade80', textDecoration: 'none'}}>MineHub</Link>
          <p style={{marginTop: '8px', color: '#cbd5e1'}}>Crie sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" style={{minWidth: '300px'}}>
          <div>
            <label htmlFor="email" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '4px'}}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '4px'}}>
              Senha (mín. 6 caracteres)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>
          {error && <p style={{color: '#f87171', fontSize: '14px'}}>{error}</p>}
          {message && <p style={{color: '#4ade80', fontSize: '14px'}}>{message}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: loading ? '#6b7280' : '#16a34a',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Criando…" : "Cadastrar"}
          </button>
        </form>
        <p style={{textAlign: 'center', color: '#cbd5e1', fontSize: '14px', marginTop: '16px'}}>
          Já tem conta?{" "}
          <Link href="/login" style={{color: '#4ade80', textDecoration: 'underline'}}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
