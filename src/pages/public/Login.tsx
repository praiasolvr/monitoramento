import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { colorAzul, colorBranco } from '../../values/colors';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleToggle = () => setIsLogin(!isLogin);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !senha) {
      Swal.fire({
        icon: 'error',
        title: '🚨 Atenção!',
        text: 'Preencha todos os campos para continuar.',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        setUser({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          displayName: userCredential.user.displayName,
        });
        Swal.fire({
          title: '🎉 Bem-vindo!',
          text: `Que bom te ver por aqui, ${userCredential.user.email}! 🚀`,
          icon: 'success',
          confirmButtonText: 'Vamos lá!',
          timer: 3500,
          timerProgressBar: true,
          showCancelButton: true,
          cancelButtonText: 'Explorar primeiro',
          background: '#f5f5f5',
        });
        navigate('/dashboard');
      } else {
        if (senha !== confirmarSenha) {
          Swal.fire({
            icon: 'error',
            title: '⚠️ Erro!',
            text: 'As senhas não coincidem. Verifique e tente novamente.',
            confirmButtonText: 'OK',
          });
          return;
        }

        if (!nome) {
          Swal.fire({
            icon: 'error',
            title: '🚨 Nome obrigatório!',
            text: 'O nome não pode estar vazio.',
            confirmButtonText: 'OK',
          });
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const uid = userCredential.user.uid;

        // Atualiza o contexto
        setUser(
          {
            email: userCredential.user.email,
            uid: uid,
            displayName: userCredential.user.displayName,
          }
        );

        // Salva os dados do cliente no Firestore usando o UID como ID do documento
        await setDoc(doc(db, 'clientes', uid), {
          nome,
          email,
          endereco: '', // inicial vazio para ser editado depois
        });

        Swal.fire({
          title: '🥳 Cadastro realizado!',
          text: `Seja bem-vindo(a), ${nome}! Aproveite a melhor experiência 🚀`,
          icon: 'success',
          confirmButtonText: 'Vamos lá!',
          timer: 3500,
          timerProgressBar: true,
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      let mensagem = 'Erro ao autenticar.';

      if (error.code === 'auth/email-already-in-use') {
        mensagem = 'Este e-mail já está em uso. Tente fazer login ou use outro e-mail.';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'O e-mail informado é inválido. Verifique e tente novamente.';
      } else if (error.code === 'auth/weak-password') {
        mensagem = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      } else if (error.code === 'auth/user-not-found') {
        mensagem = 'Usuário não encontrado. Verifique o e-mail ou cadastre-se.';
      } else if (error.code === 'auth/wrong-password') {
        mensagem = 'Senha incorreta. Tente novamente.';
      }

      Swal.fire({
        icon: 'error',
        title: '🚨 Ocorreu um erro!',
        text: mensagem,
        confirmButtonText: 'Tentar novamente',
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#EAF0F6',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px',
      }}>
        <h2 style={{ color: colorAzul, marginBottom: '10px', textAlign: 'center' }}>
          {isLogin ? 'Entrar' : 'Criar conta'}
        </h2>
        <p style={{ color: '#777', textAlign: 'center', marginBottom: '30px' }}>
          {isLogin
            ? 'Faça login para acessar o painel'
            : 'Preencha os campos abaixo para se cadastrar'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label' style={{ color: '#444' }}>E-mail</label>
            <input
              type='email'
              className='form-control'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='exemplo@dominio.com'
              required
              style={{ padding: '10px', borderRadius: '8px' }}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' style={{ color: '#444' }}>Senha</label>
            <input
              type='password'
              className='form-control'
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder='Digite sua senha'
              required
              style={{ padding: '10px', borderRadius: '8px' }}
            />
          </div>

          {!isLogin && (
            <>
              <div className='mb-3'>
                <label className='form-label' style={{ color: '#444' }}>Confirme sua senha</label>
                <input
                  type='password'
                  className='form-control'
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder='Confirme sua senha'
                  required
                  style={{ padding: '10px', borderRadius: '8px' }}
                />
              </div>

              <div className='mb-3'>
                <label className='form-label' style={{ color: '#444' }}>Seu nome</label>
                <input
                  type='text'
                  className='form-control'
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder='Digite seu nome completo'
                  required
                  style={{ padding: '10px', borderRadius: '8px' }}
                />
              </div>
            </>
          )}

          <button
            type='submit'
            className='btn w-100'
            style={{
              backgroundColor: colorAzul,
              color: colorBranco,
              padding: '12px',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '10px',
              transition: '0.3s ease',
            }}
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        {/* <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <span style={{ color: '#666' }}>
            {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
          </span>
          <br />
          <button
            onClick={handleToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: colorAzul,
              fontWeight: 'bold',
              marginTop: '10px',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            {isLogin ? 'Cadastre-se' : 'Fazer login'}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;