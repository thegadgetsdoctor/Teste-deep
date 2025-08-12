
// Seletores
const tabButtons = document.querySelectorAll('.tablinks');
const tabContents = document.querySelectorAll('.tabcontent');

// Dados
let visitas = JSON.parse(localStorage.getItem('visitas')) || [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Abre a primeira aba por padrão
    openTab(null, 'entrada');
    atualizarRelatorio();

    // Adiciona listeners para as abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            openTab(null, tabName);
        });
    });
});

// Funções (mantenha as do original, mas sem HTML inline)
function openTab(evt, tabName) {
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// ... (adicione todas as outras funções aqui, como registrarEntrada, buscarVisitante, etc.)
