// conflito resolvido manualmente
// script.js - Lógica das abas

document.addEventListener('DOMContentLoaded', function() {
    const tablinks = document.querySelectorAll('.tablinks');
    const tabcontents = document.querySelectorAll('.tabcontent');

    function openTab(tabName) {
        tabcontents.forEach(tc => tc.classList.remove('active'));
        tablinks.forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        document.querySelector('.tablinks[data-tab="' + tabName + '"]').classList.add('active');
    }

    tablinks.forEach(btn => {
        btn.addEventListener('click', function() {
            openTab(this.getAttribute('data-tab'));
        });
    });

    // Exibe a primeira aba por padrão
    if(tablinks.length) openTab(tablinks[0].getAttribute('data-tab'));

    // Exemplo de feedback visual nos formulários
    document.getElementById('form-entrada').addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('feedback-entrada').textContent = 'Entrada registrada com sucesso!';
        this.reset();
        setTimeout(() => document.getElementById('feedback-entrada').textContent = '', 2000);
    });
    document.getElementById('form-saida').addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('feedback-saida').textContent = 'Saída registrada com sucesso!';
        this.reset();
        setTimeout(() => document.getElementById('feedback-saida').textContent = '', 2000);
    });

    // Exemplo de usuário logado (mock)
    const userInfo = document.getElementById('user-info');
    const userBadge = document.getElementById('user-badge');
    const logoutBtn = document.getElementById('logout-btn');
    // Simulação: mostrar usuário admin logado
    userInfo.style.display = 'flex';
    userBadge.textContent = 'admin (admin)';
    logoutBtn.style.display = 'inline-block';
    logoutBtn.onclick = function() {
        userInfo.style.display = 'none';
        alert('Logout simulado!');
    };
});
=======
// script.js - Lógica de UI e navegação
document.addEventListener('DOMContentLoaded', function() {
    // Abas
    const tablinks = document.querySelectorAll('.tablinks');
    const tabcontents = document.querySelectorAll('.tabcontent');
    function openTab(evt, tabName) {
        tabcontents.forEach(tc => tc.style.display = 'none');
        tablinks.forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabName).style.display = 'block';
        evt.currentTarget.classList.add('active');
    }
    tablinks.forEach(btn => {
        btn.addEventListener('click', function(e) {
            openTab(e, this.getAttribute('data-tab') || this.textContent.toLowerCase());
        });
    });
    // Exibe a primeira aba por padrão
    if(tablinks.length) {
        tablinks[0].classList.add('active');
        tabcontents[0].style.display = 'block';
    }
    // Foco automático no campo de busca ao abrir aba de saída
    document.querySelectorAll('.tablinks').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('Saída')) {
                setTimeout(() => {
                    const busca = document.getElementById('buscaSaida');
                    if (busca) busca.focus();
                }, 100);
            }
        });
    });
});
// script.js - Lógica das abas

document.addEventListener('DOMContentLoaded', function() {
    const tablinks = document.querySelectorAll('.tablinks');
    const tabcontents = document.querySelectorAll('.tabcontent');

    function openTab(tabName) {
        tabcontents.forEach(tc => tc.classList.remove('active'));
        tablinks.forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        document.querySelector('.tablinks[data-tab="' + tabName + '"]').classList.add('active');
    }

    tablinks.forEach(btn => {
        btn.addEventListener('click', function() {
            openTab(this.getAttribute('data-tab'));
        });
    });

    // Exibe a primeira aba por padrão
    if(tablinks.length) openTab(tablinks[0].getAttribute('data-tab'));

    // Exemplo de feedback visual nos formulários
    document.getElementById('form-entrada').addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('feedback-entrada').textContent = 'Entrada registrada com sucesso!';
        this.reset();
        setTimeout(() => document.getElementById('feedback-entrada').textContent = '', 2000);
    });
    document.getElementById('form-saida').addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('feedback-saida').textContent = 'Saída registrada com sucesso!';
        this.reset();
        setTimeout(() => document.getElementById('feedback-saida').textContent = '', 2000);
    });

    // Exemplo de usuário logado (mock)
    const userInfo = document.getElementById('user-info');
    const userBadge = document.getElementById('user-badge');
    const logoutBtn = document.getElementById('logout-btn');
    // Simulação: mostrar usuário admin logado
    userInfo.style.display = 'flex';
    userBadge.textContent = 'admin (admin)';
    logoutBtn.style.display = 'inline-block';
    logoutBtn.onclick = function() {
        userInfo.style.display = 'none';
        alert('Logout simulado!');
    };
});
>>>>>>> e43a026 (Primeiro commit do sistema portaria)
