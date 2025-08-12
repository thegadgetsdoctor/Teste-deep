// conflito resolvido manualmente
// Este script implementa:
// - Login seguro (hash de senha)
// - Permissões de usuário (admin/porteiro)
// - Importação de planilha CSV
// - Pesquisa e cadastro de usuários
//
// Requer: index.html com campos de login, upload de planilha e área de pesquisa/cadastro

// Utilitário para hash de senha simples (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

let usuarios = []; // A lista de usuários será gerenciada pelo IndexedDB
let usuarioLogado = null;
let tentativasLogin = 0;
let bloqueadoAte = null;

// Inicializa o banco de dados IndexedDB e carrega usuários
async function inicializarSistema() {
    if (typeof dbInit === 'function') await dbInit();
    usuarios = await dbGetAllUsuarios();
    await criarAdminPadrao();
    await pesquisarUsuario();
}
inicializarSistema();

// Cria ou sobrescreve admin padrão sempre que o sistema inicia
async function criarAdminPadrao() {
    const hash = await hashPassword('admin');
    // Tenta atualizar, se não existir, adiciona
    try {
        await dbUpdateUsuario({ usuario: 'admin', nome: 'Administrador', cpf: '', tipo: 'admin', senha: hash });
    } catch (e) {
        await dbAddUsuario({ usuario: 'admin', nome: 'Administrador', cpf: '', tipo: 'admin', senha: hash });
    }
}

// Permissões: admin pode tudo, porteiro só cria/visualiza
function temPermissao(acao) {
    if (!usuarioLogado) return false;
    if (usuarioLogado.tipo === 'admin') return true;
    if (usuarioLogado.tipo === 'porteiro') {
        return acao === 'criar' || acao === 'visualizar';
    }
    return false;
}

// Login usando IndexedDB
async function login(event) {
    event.preventDefault();
    const feedback = document.getElementById('login-feedback');
    feedback.innerText = '';
    if (bloqueadoAte && Date.now() < bloqueadoAte) {
        feedback.innerText = 'Muitas tentativas. Tente novamente em 1 minuto.';
        return;
    }
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const hash = await hashPassword(pass);
    const found = await dbGetUsuario(user);
    if (found && found.senha === hash) {
        usuarioLogado = found;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('app-area').style.display = '';
        document.getElementById('user-badge').innerText = usuarioLogado.usuario + ' (' + usuarioLogado.tipo + ')';
        tentativasLogin = 0;
        feedback.innerText = '';
    if (typeof atualizarRelatorio === 'function') atualizarRelatorio();
        await dbAddLog({acao: 'login', usuario: user, data: new Date().toISOString()});
    } else {
        tentativasLogin++;
        if (tentativasLogin >= 5) {
            bloqueadoAte = Date.now() + 60000;
            feedback.innerText = 'Muitas tentativas. Tente novamente em 1 minuto.';
        } else {
            feedback.innerText = 'Usuário ou senha inválidos!';
        }
    }
// ...existing code...
}

// Logout
function logout() {
    usuarioLogado = null;
    localStorage.removeItem('usuarioLogado');
    document.getElementById('login-area').style.display = '';
    document.getElementById('app-area').style.display = 'none';
}

// Importação de planilha CSV
function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const linhas = e.target.result.split(/\r?\n/);
        let novos = 0, repetidos = 0, incompletos = 0;
        for (let linha of linhas) {
            if (!linha.trim()) continue;
            const [usuario, nome, cpf, tipo, senha] = linha.split(',');
            if (!usuario || !nome || !cpf || !tipo || !senha) { incompletos++; continue; }
            if (usuarios.some(u => u.usuario === usuario)) { repetidos++; continue; }
            usuarios.push({ usuario, nome, cpf, tipo, senha: senha, senhaOriginal: senha });
            novos++;
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        alert(`Importação concluída! Novos: ${novos}, Repetidos: ${repetidos}, Incompletos: ${incompletos}`);
    };
    reader.readAsText(file);
}

// Cadastro de novo usuário (apenas admin) usando IndexedDB
async function cadastrarUsuario(event) {
    event.preventDefault();
    const feedback = document.getElementById('cadastro-feedback');
    feedback.innerText = '';
    if (!temPermissao('criar')) { feedback.innerText = 'Sem permissão!'; return; }
    const usuario = document.getElementById('novo-usuario').value.trim();
    const nome = document.getElementById('novo-nome').value.trim();
    const cpf = document.getElementById('novo-cpf').value.trim();
    const tipo = document.getElementById('novo-tipo').value;
    const senha = document.getElementById('novo-senha').value;
    if (!usuario || !nome || !cpf || !tipo || !senha) { feedback.innerText = 'Preencha todos os campos!'; return; }
    const existe = await dbGetUsuario(usuario);
    if (existe) { feedback.innerText = 'Usuário já existe!'; return; }
    const hash = await hashPassword(senha);
    await dbAddUsuario({ usuario, nome, cpf, tipo, senha: hash });
    feedback.innerText = 'Usuário cadastrado!';
    document.getElementById('cadastro-form').reset();
    await dbAddLog({acao: 'cadastro_usuario', usuario: usuarioLogado ? usuarioLogado.usuario : 'sistema', alvo: usuario, data: new Date().toISOString()});
}

// Pesquisa de usuário usando IndexedDB
async function pesquisarUsuario() {
    const termo = document.getElementById('pesquisa').value.toLowerCase();
    const lista = document.getElementById('lista-usuarios');
    lista.innerHTML = '';
    const todos = await dbGetAllUsuarios();
    todos.filter(u => u.nome.toLowerCase().includes(termo) || u.cpf.includes(termo)).forEach(u => {
        const li = document.createElement('li');
        li.innerText = `${u.nome} (${u.usuario}) - ${u.tipo}`;
        lista.appendChild(li);
    });
}

// Carregar usuário logado ao abrir
window.onload = async function() {
    const u = localStorage.getItem('usuarioLogado');
    if (u) {
        usuarioLogado = JSON.parse(u);
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('app-area').style.display = '';
        document.getElementById('user-badge').innerText = usuarioLogado.usuario + ' (' + usuarioLogado.tipo + ')';
    } else {
        document.getElementById('login-area').style.display = '';
        document.getElementById('app-area').style.display = 'none';
    }
    // Não chama pesquisarUsuario aqui, pois já é chamado em inicializarSistema
};
=======
// Este script implementa:
// - Login seguro (hash de senha)
// - Permissões de usuário (admin/porteiro)
// - Importação de planilha CSV
// - Pesquisa e cadastro de usuários
//
// Requer: index.html com campos de login, upload de planilha e área de pesquisa/cadastro

// Utilitário para hash de senha simples (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

let usuarios = []; // A lista de usuários será gerenciada pelo IndexedDB
let usuarioLogado = null;
let tentativasLogin = 0;
let bloqueadoAte = null;

// Inicializa o banco de dados IndexedDB e carrega usuários
async function inicializarSistema() {
    if (typeof dbInit === 'function') await dbInit();
    usuarios = await dbGetAllUsuarios();
    await criarAdminPadrao();
    await pesquisarUsuario();
}
inicializarSistema();

// Cria ou sobrescreve admin padrão sempre que o sistema inicia
async function criarAdminPadrao() {
    const hash = await hashPassword('admin');
    // Tenta atualizar, se não existir, adiciona
    try {
        await dbUpdateUsuario({ usuario: 'admin', nome: 'Administrador', cpf: '', tipo: 'admin', senha: hash });
    } catch (e) {
        await dbAddUsuario({ usuario: 'admin', nome: 'Administrador', cpf: '', tipo: 'admin', senha: hash });
    }
}

// Permissões: admin pode tudo, porteiro só cria/visualiza
function temPermissao(acao) {
    if (!usuarioLogado) return false;
    if (usuarioLogado.tipo === 'admin') return true;
    if (usuarioLogado.tipo === 'porteiro') {
        return acao === 'criar' || acao === 'visualizar';
    }
    return false;
}

// Login usando IndexedDB
async function login(event) {
    event.preventDefault();
    const feedback = document.getElementById('login-feedback');
    feedback.innerText = '';
    if (bloqueadoAte && Date.now() < bloqueadoAte) {
        feedback.innerText = 'Muitas tentativas. Tente novamente em 1 minuto.';
        return;
    }
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const hash = await hashPassword(pass);
    const found = await dbGetUsuario(user);
    if (found && found.senha === hash) {
        usuarioLogado = found;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('app-area').style.display = '';
        document.getElementById('user-badge').innerText = usuarioLogado.usuario + ' (' + usuarioLogado.tipo + ')';
        tentativasLogin = 0;
        feedback.innerText = '';
    if (typeof atualizarRelatorio === 'function') atualizarRelatorio();
        await dbAddLog({acao: 'login', usuario: user, data: new Date().toISOString()});
    } else {
        tentativasLogin++;
        if (tentativasLogin >= 5) {
            bloqueadoAte = Date.now() + 60000;
            feedback.innerText = 'Muitas tentativas. Tente novamente em 1 minuto.';
        } else {
            feedback.innerText = 'Usuário ou senha inválidos!';
        }
    }
// ...existing code...
}

// Logout
function logout() {
    usuarioLogado = null;
    localStorage.removeItem('usuarioLogado');
    document.getElementById('login-area').style.display = '';
    document.getElementById('app-area').style.display = 'none';
}

// Importação de planilha CSV
function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const linhas = e.target.result.split(/\r?\n/);
        let novos = 0, repetidos = 0, incompletos = 0;
        for (let linha of linhas) {
            if (!linha.trim()) continue;
            const [usuario, nome, cpf, tipo, senha] = linha.split(',');
            if (!usuario || !nome || !cpf || !tipo || !senha) { incompletos++; continue; }
            if (usuarios.some(u => u.usuario === usuario)) { repetidos++; continue; }
            usuarios.push({ usuario, nome, cpf, tipo, senha: senha, senhaOriginal: senha });
            novos++;
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        alert(`Importação concluída! Novos: ${novos}, Repetidos: ${repetidos}, Incompletos: ${incompletos}`);
    };
    reader.readAsText(file);
}

// Cadastro de novo usuário (apenas admin) usando IndexedDB
async function cadastrarUsuario(event) {
    event.preventDefault();
    const feedback = document.getElementById('cadastro-feedback');
    feedback.innerText = '';
    if (!temPermissao('criar')) { feedback.innerText = 'Sem permissão!'; return; }
    const usuario = document.getElementById('novo-usuario').value.trim();
    const nome = document.getElementById('novo-nome').value.trim();
    const cpf = document.getElementById('novo-cpf').value.trim();
    const tipo = document.getElementById('novo-tipo').value;
    const senha = document.getElementById('novo-senha').value;
    if (!usuario || !nome || !cpf || !tipo || !senha) { feedback.innerText = 'Preencha todos os campos!'; return; }
    const existe = await dbGetUsuario(usuario);
    if (existe) { feedback.innerText = 'Usuário já existe!'; return; }
    const hash = await hashPassword(senha);
    await dbAddUsuario({ usuario, nome, cpf, tipo, senha: hash });
    feedback.innerText = 'Usuário cadastrado!';
    document.getElementById('cadastro-form').reset();
    await dbAddLog({acao: 'cadastro_usuario', usuario: usuarioLogado ? usuarioLogado.usuario : 'sistema', alvo: usuario, data: new Date().toISOString()});
}

// Pesquisa de usuário usando IndexedDB
async function pesquisarUsuario() {
    const termo = document.getElementById('pesquisa').value.toLowerCase();
    const lista = document.getElementById('lista-usuarios');
    lista.innerHTML = '';
    const todos = await dbGetAllUsuarios();
    todos.filter(u => u.nome.toLowerCase().includes(termo) || u.cpf.includes(termo)).forEach(u => {
        const li = document.createElement('li');
        li.innerText = `${u.nome} (${u.usuario}) - ${u.tipo}`;
        lista.appendChild(li);
    });
}

// Carregar usuário logado ao abrir
window.onload = async function() {
    const u = localStorage.getItem('usuarioLogado');
    if (u) {
        usuarioLogado = JSON.parse(u);
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('app-area').style.display = '';
        document.getElementById('user-badge').innerText = usuarioLogado.usuario + ' (' + usuarioLogado.tipo + ')';
    } else {
        document.getElementById('login-area').style.display = '';
        document.getElementById('app-area').style.display = 'none';
    }
    // Não chama pesquisarUsuario aqui, pois já é chamado em inicializarSistema
};
// Este script implementa:
// - Login seguro (hash de senha)
// - Permissões de usuário (admin/porteiro)
// - Importação de planilha CSV
// - Pesquisa e cadastro de usuários
//
// Requer: index.html com campos de login, upload de planilha e área de pesquisa/cadastro

// Utilitário para hash de senha simples (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

let usuarios = []; // A lista de usuários será gerenciada pelo IndexedDB
let usuarioLogado = null;
let tentativasLogin = 0;
let bloqueadoAte = null;

// Inicializa o banco de dados IndexedDB e carrega usuários
async function inicializarSistema() {
    if (typeof dbInit === 'function') await dbInit();
    usuarios = await dbGetAllUsuarios();
    await criarAdminPadrao();
    await pesquisarUsuario();
}
inicializarSistema();

// Cria ou sobrescreve admin padrão sempre que o sistema inicia
async function criarAdminPadrao() {
    const hash = await hashPassword('admin');
    // Tenta atualizar, se não existir, adiciona
    try {
        await dbUpdateUsuario({ usuario: 'admin', nome: 'Administrador', cpf: '', tipo: 'admin', senha: hash });
    } catch (e) {
        await dbAddUsuario({ usuario: 'admin', nome: 'Administrador', cpf: '', tipo: 'admin', senha: hash });
    }
}

// Permissões: admin pode tudo, porteiro só cria/visualiza
function temPermissao(acao) {
    if (!usuarioLogado) return false;
    if (usuarioLogado.tipo === 'admin') return true;
    if (usuarioLogado.tipo === 'porteiro') {
        return acao === 'criar' || acao === 'visualizar';
    }
    return false;
}

// Login usando IndexedDB
async function login(event) {
    event.preventDefault();
    const feedback = document.getElementById('login-feedback');
    feedback.innerText = '';
    if (bloqueadoAte && Date.now() < bloqueadoAte) {
        feedback.innerText = 'Muitas tentativas. Tente novamente em 1 minuto.';
        return;
    }
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const hash = await hashPassword(pass);
    const found = await dbGetUsuario(user);
    if (found && found.senha === hash) {
        usuarioLogado = found;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('app-area').style.display = '';
        document.getElementById('user-badge').innerText = usuarioLogado.usuario + ' (' + usuarioLogado.tipo + ')';
        tentativasLogin = 0;
        feedback.innerText = '';
    if (typeof atualizarRelatorio === 'function') atualizarRelatorio();
        await dbAddLog({acao: 'login', usuario: user, data: new Date().toISOString()});
    } else {
        tentativasLogin++;
        if (tentativasLogin >= 5) {
            bloqueadoAte = Date.now() + 60000;
            feedback.innerText = 'Muitas tentativas. Tente novamente em 1 minuto.';
        } else {
            feedback.innerText = 'Usuário ou senha inválidos!';
        }
    }
// ...existing code...
}

// Logout
function logout() {
    usuarioLogado = null;
    localStorage.removeItem('usuarioLogado');
    document.getElementById('login-area').style.display = '';
    document.getElementById('app-area').style.display = 'none';
}

// Importação de planilha CSV
function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const linhas = e.target.result.split(/\r?\n/);
        let novos = 0, repetidos = 0, incompletos = 0;
        for (let linha of linhas) {
            if (!linha.trim()) continue;
            const [usuario, nome, cpf, tipo, senha] = linha.split(',');
            if (!usuario || !nome || !cpf || !tipo || !senha) { incompletos++; continue; }
            if (usuarios.some(u => u.usuario === usuario)) { repetidos++; continue; }
            usuarios.push({ usuario, nome, cpf, tipo, senha: senha, senhaOriginal: senha });
            novos++;
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        alert(`Importação concluída! Novos: ${novos}, Repetidos: ${repetidos}, Incompletos: ${incompletos}`);
    };
    reader.readAsText(file);
}

// Cadastro de novo usuário (apenas admin) usando IndexedDB
async function cadastrarUsuario(event) {
    event.preventDefault();
    const feedback = document.getElementById('cadastro-feedback');
    feedback.innerText = '';
    if (!temPermissao('criar')) { feedback.innerText = 'Sem permissão!'; return; }
    const usuario = document.getElementById('novo-usuario').value.trim();
    const nome = document.getElementById('novo-nome').value.trim();
    const cpf = document.getElementById('novo-cpf').value.trim();
    const tipo = document.getElementById('novo-tipo').value;
    const senha = document.getElementById('novo-senha').value;
    if (!usuario || !nome || !cpf || !tipo || !senha) { feedback.innerText = 'Preencha todos os campos!'; return; }
    const existe = await dbGetUsuario(usuario);
    if (existe) { feedback.innerText = 'Usuário já existe!'; return; }
    const hash = await hashPassword(senha);
    await dbAddUsuario({ usuario, nome, cpf, tipo, senha: hash });
    feedback.innerText = 'Usuário cadastrado!';
    document.getElementById('cadastro-form').reset();
    await dbAddLog({acao: 'cadastro_usuario', usuario: usuarioLogado ? usuarioLogado.usuario : 'sistema', alvo: usuario, data: new Date().toISOString()});
}

// Pesquisa de usuário usando IndexedDB
async function pesquisarUsuario() {
    const termo = document.getElementById('pesquisa').value.toLowerCase();
    const lista = document.getElementById('lista-usuarios');
    lista.innerHTML = '';
    const todos = await dbGetAllUsuarios();
    todos.filter(u => u.nome.toLowerCase().includes(termo) || u.cpf.includes(termo)).forEach(u => {
        const li = document.createElement('li');
        li.innerText = `${u.nome} (${u.usuario}) - ${u.tipo}`;
        lista.appendChild(li);
    });
}

// Carregar usuário logado ao abrir
window.onload = async function() {
    const u = localStorage.getItem('usuarioLogado');
    if (u) {
        usuarioLogado = JSON.parse(u);
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('app-area').style.display = '';
        document.getElementById('user-badge').innerText = usuarioLogado.usuario + ' (' + usuarioLogado.tipo + ')';
    } else {
        document.getElementById('login-area').style.display = '';
        document.getElementById('app-area').style.display = 'none';
    }
    // Não chama pesquisarUsuario aqui, pois já é chamado em inicializarSistema
};
>>>>>>> e43a026 (Primeiro commit do sistema portaria)
