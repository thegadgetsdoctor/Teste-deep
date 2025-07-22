// Variáveis globais
const maintenanceOverlay = document.getElementById('maintenanceOverlay');
const chatbot = document.getElementById('chatbot');
const openChat = document.getElementById('openChat');
const closeChat = document.querySelector('.close-chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.querySelector('.chat-messages');
const appointmentModal = document.getElementById('appointmentModal');
const serviceModal = document.getElementById('serviceModal');
const loginContainer = document.getElementById('loginContainer');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const floatingBtns = document.querySelector('.floating-btns');
const backTopBtn = document.querySelector('.back-top');
const appointmentBtn = document.querySelector('.appointment');
const toast = document.getElementById('toast');
const testimonialSlider = document.getElementById('testimonialSlider');
const prevTestimonial = document.getElementById('prevTestimonial');
const nextTestimonial = document.getElementById('nextTestimonial');
const faqItems = document.querySelectorAll('.faq-item');

// Funções de utilidade
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 10) value = value.substring(0, 11);
  if (value.length > 2) {
    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
  }
  if (value.length > 9) {
    value = value.replace(/(\(\d{2}\)\s\d{4,5})(\d{4})/, '$1-$2');
  }
  input.value = value;
}

// Página de manutenção
function hideMaintenance() {
  maintenanceOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Chatbot
openChat.addEventListener('click', () => {
  chatbot.classList.add('active');
  floatingBtns.classList.remove('visible');
});

closeChat.addEventListener('click', () => {
  chatbot.classList.remove('active');
  floatingBtns.classList.add('visible');
});

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && chatInput.value.trim()) {
    const message = chatInput.value.trim();
    chatMessages.innerHTML += `<div class="message user-message">${message}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.value = '';
    setTimeout(() => {
      chatMessages.innerHTML += '<div class="message bot-message">Obrigado pela mensagem! Estamos analisando e retornaremos em breve.</div>';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
  }
});

// Modal de agendamento
function openAppointmentModal() {
  appointmentModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

document.querySelector('.close-modal').addEventListener('click', () => {
  appointmentModal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

document.getElementById('appointmentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Agendamento enviado com sucesso!', 'success');
  appointmentModal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Modal de serviço
function openServiceModal(service) {
  const services = {
    manutencao: { title: 'Manutenção de Celulares', icon: 'fas fa-mobile-alt', content: 'Detalhes adicionais sobre manutenção de celulares...' },
    informatica: { title: 'Suporte em Informática', icon: 'fas fa-laptop', content: 'Detalhes adicionais sobre suporte em informática...' },
    redes: { title: 'Redes e Infraestrutura', icon: 'fas fa-network-wired', content: 'Detalhes adicionais sobre redes e infraestrutura...' },
    cameras: { title: 'Câmeras de Segurança', icon: 'fas fa-video', content: 'Detalhes adicionais sobre câmeras de segurança...' },
    sites: { title: 'Desenvolvimento Web', icon: 'fas fa-globe', content: 'Detalhes adicionais sobre desenvolvimento web...' },
    personalizado: { title: 'Soluções Personalizadas', icon: 'fas fa-puzzle-piece', content: 'Detalhes adicionais sobre soluções personalizadas...' }
  };
  const data = services[service];
  document.getElementById('service-modal-title').textContent = data.title;
  document.getElementById('service-modal-icon').innerHTML = `<i class="${data.icon}"></i>`;
  document.getElementById('service-modal-content').textContent = data.content;
  serviceModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
  serviceModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

document.querySelector('.service-modal .close-modal').addEventListener('click', closeServiceModal);

function redirectToWhatsApp() {
  window.open('https://wa.me/5543991678501', '_blank');
}

// Modal de login
function openLoginModal() {
  loginContainer.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function selectUserType(type) {
  const buttons = document.querySelectorAll('.user-type-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.closest('.user-type-btn').classList.add('active');
}

document.querySelector('.login-container .close-modal').addEventListener('click', () => {
  loginContainer.style.display = 'none';
  document.body.style.overflow = 'auto';
});

function showRegister() {
  showToast('Funcionalidade de cadastro em desenvolvimento!', 'info');
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Login realizado com sucesso!', 'success');
  loginContainer.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Alternância de tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('theme', newTheme);
}

if (localStorage.getItem('theme')) {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
  themeIcon.className = localStorage.getItem('theme') === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Scroll e visibilidade
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      section.classList.add('visible');
    }
  });

  if (window.scrollY > 300) {
    floatingBtns.classList.add('visible');
    backTopBtn.style.display = 'flex';
    appointmentBtn.style.display = 'flex';
  } else {
    floatingBtns.classList.remove('visible');
    backTopBtn.style.display = 'none';
    appointmentBtn.style.display = 'none';
  }
});

// Slider de depoimentos
let currentSlide = 0;
const slides = document.querySelectorAll('.testimonial-card');

function updateSlider() {
  testimonialSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

prevTestimonial.addEventListener('click', () => {
  if (currentSlide > 0) {
    currentSlide--;
    updateSlider();
  }
});

nextTestimonial.addEventListener('click', () => {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
    updateSlider();
  }
});

// Accordion FAQ
faqItems.forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});

// Validação de formulário de contato
document.querySelector('.contact-form form').addEventListener('submit', (e) => {
  e.preventDefault();
  const formGroups = document.querySelectorAll('.contact-form .form-group');
  let isValid = true;

  formGroups.forEach(group => {
    const input = group.querySelector('.form-control');
    const error = group.querySelector('.error-message');
    if (!input.value.trim()) {
      group.classList.add('invalid');
      isValid = false;
    } else {
      group.classList.remove('invalid');
    }
    if (input.type === 'email' && !input.value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      group.classList.add('invalid');
      isValid = false;
    }
    if (input.type === 'tel' && !input.value.match(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/)) {
      group.classList.add('invalid');
      isValid = false;
    }
  });

  if (isValid) {
    showToast('Mensagem enviada com sucesso!', 'success');
    document.querySelector('.contact-form form').reset();
    formGroups.forEach(group => group.classList.remove('invalid'));
  } else {
    showToast('Por favor, corrija os erros no formulário.', 'error');
  }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  if (maintenanceOverlay) hideMaintenance();
  window.scrollTo(0, 0);
});