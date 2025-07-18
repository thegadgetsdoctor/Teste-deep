// Funções JavaScript
function redirectToWhatsApp(service) {
  const message = `Olá, gostaria de informações sobre ${service}`;
  window.open(`https://wa.me/5543991678501?text=${encodeURIComponent(message)}`, '_blank');
}

// Observador de interseção para animações
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  document.querySelectorAll('.section').forEach(section => observer.observe(section));
} else {
  document.querySelectorAll('.section').forEach(section => section.classList.add('visible'));
}

// Navegação suave
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    window.scrollTo({
      top: targetElement.offsetTop - 80,
      behavior: 'smooth'
    });
    document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
    this.classList.add('active');
  });
});

// Controle de rolagem
window.addEventListener('scroll', () => {
  // Lógica de rolagem
});

// Alternador de tema
function toggleTheme() {
  // Lógica do tema
}

// Validação de formulário
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
  // Lógica de validação
}

// Slider de depoimentos
const testimonialSlider = document.getElementById('testimonialSlider');
// Lógica do slider

// FAQ - Acordeão
document.querySelectorAll('.faq-item').forEach(item => {
  // Lógica do acordeão
});

// Modal de agendamento
const appointmentModal = document.getElementById('appointmentModal');
// Lógica do modal

// Chatbot
const chatbot = document.getElementById('chatbot');
// Lógica do chatbot

// Toast notifications
function showToast(message, type) {
  // Lógica de notificação
}

// Schema markup
const schemaScript = document.createElement('script');
// Schema markup content
document.head.appendChild(schemaScript);

// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');