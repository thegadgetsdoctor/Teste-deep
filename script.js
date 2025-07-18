function redirectToWhatsApp(service) {
  const message = `Olá, gostaria de informações sobre ${service}`;
  window.open(`https://wa.me/5543991678501?text=${encodeURIComponent(message)}`,'_blank');
}

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

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= (sectionTop - 150)) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
  
  const backTopBtn = document.querySelector('.back-top');
  if (window.scrollY > 300) {
    backTopBtn.style.display = 'flex';
  } else {
    backTopBtn.style.display = 'none';
  }
});

function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  if (body.getAttribute('data-theme') === 'dark') {
    body.removeAttribute('data-theme');
    themeIcon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    themeIcon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'dark');
  }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.setAttribute('data-theme', 'dark');
  document.getElementById('theme-icon').className = 'fas fa-sun';
}

const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
  const formGroups = contactForm.querySelectorAll('.form-group');
  const formFeedback = document.getElementById('form-feedback');
  
  formGroups.forEach(group => {
    const input = group.querySelector('.form-control');
    input.addEventListener('input', () => {
      validateField(group, input);
    });
  });
  
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
    validateField(group, input);
  }
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;
    
    formGroups.forEach(group => {
      const input = group.querySelector('.form-control');
      if (!validateField(group, input)) isValid = false;
    });
    
    if (isValid) {
      const formData = new FormData(contactForm);
      try {
        const response = await fetch('https://formspree.io/f/xeokwpdd', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          showToast('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
          contactForm.reset();
        } else {
          throw new Error('Erro ao enviar o formulário.');
        }
      } catch (error) {
        showToast('Erro ao enviar. Tente novamente ou entre em contato diretamente.', 'error');
      }
    }
  });
  
  function validateField(group, input) {
    const fieldName = group.dataset.validate;
    let isValid = true;
    
    switch (fieldName) {
      case 'nome':
        isValid = input.value.trim().length > 0;
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        break;
      case 'telefone':
        isValid = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(input.value.trim());
        break;
      case 'servico':
        isValid = input.value !== '';
        break;
      case 'mensagem':
        isValid = input.value.trim().length > 0;
        break;
    }
    
    group.classList.toggle('invalid', !isValid);
    return isValid;
  }
}

const testimonialSlider = document.getElementById('testimonialSlider');
const prevBtn = document.getElementById('prevTestimonial');
const nextBtn = document.getElementById('nextTestimonial');
let currentSlide = 0;
const slideCount = testimonialSlider.children.length;

function showSlide(index) {
  if (index < 0) index = slideCount - 1;
  if (index >= slideCount) index = 0;
  testimonialSlider.style.transform = `translateX(-${index * 100}%)`;
  currentSlide = index;
}

prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
setInterval(() => showSlide(currentSlide + 1), 5000);

document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});

const appointmentModal = document.getElementById('appointmentModal');
const appointmentForm = document.getElementById('appointmentForm');

function openAppointmentModal() {
  appointmentModal.style.display = 'flex';
}

function closeAppointmentModal() {
  appointmentModal.style.display = 'none';
}

document.querySelector('.close-modal').addEventListener('click', closeAppointmentModal);
appointmentModal.addEventListener('click', (e) => {
  if (e.target === appointmentModal) closeAppointmentModal();
});

appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('appointment-name').value;
  const phone = document.getElementById('appointment-phone').value;
  const service = document.getElementById('appointment-service').value;
  const date = document.getElementById('appointment-date').value;
  
  if (!name || !phone || !service || !date) {
    showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
    return;
  }
  
  try {
    const formData = new FormData(appointmentForm);
    const response = await fetch('https://formspree.io/f/xeokwpdd', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      showToast('Agendamento enviado com sucesso! Entraremos em contato para confirmar.', 'success');
      appointmentForm.reset();
      closeAppointmentModal();
    } else {
      throw new Error('Erro no envio');
    }
  } catch (error) {
    showToast('Erro ao enviar agendamento. Tente novamente ou entre em contato via WhatsApp.', 'error');
  }
});

const chatbot = document.getElementById('chatbot');
const openChatBtn = document.getElementById('openChat');
const closeChatBtn = document.querySelector('.close-chat');
const chatInput = document.getElementById('chat-input');

openChatBtn.addEventListener('click', () => {
  chatbot.classList.add('active');
});

closeChatBtn.addEventListener('click', () => {
  chatbot.classList.remove('active');
});

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

document.querySelector('.chat-input button').addEventListener('click', sendMessage);

function sendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    const messagesContainer = document.querySelector('.chat-messages');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = message;
    messagesContainer.appendChild(userMessageDiv);
    chatInput.value = '';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message';
    typingIndicator.textContent = 'Digitando...';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    setTimeout(() => {
      messagesContainer.removeChild(typingIndicator);
      const botMessage = generateBotResponse(message);
      const botMessageDiv = document.createElement('div');
      botMessageDiv.className = 'message bot-message';
      botMessageDiv.textContent = botMessage;
      messagesContainer.appendChild(botMessageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);
  }
}

function generateBotResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('ola') || lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
    return "Olá! Como posso ajudar você hoje?";
  }
  
  if (lowerMessage.includes('serviço') || lowerMessage.includes('servico')) {
    return "Oferecemos serviços de manutenção de celulares, informática, redes, câmeras de segurança e criação de sites. Qual serviço você precisa?";
  }
  
  if (lowerMessage.includes('preço') || lowerMessage.includes('preco') || lowerMessage.includes('valor')) {
    return "Os preços variam conforme o serviço e o equipamento. Posso encaminhar seu contato para um orçamento personalizado?";
  }
  
  if (lowerMessage.includes('agendar') || lowerMessage.includes('marcar')) {
    return "Para agendar um serviço, você pode clicar no botão 'Agendar Serviço' no site ou me informar seus dados que eu encaminho para nossa equipe.";
  }
  
  if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('whatsapp')) {
    return "Nosso telefone é (43) 99167-8501. Você também pode falar conosco pelo WhatsApp clicando no ícone flutuante.";
  }
  
  if (lowerMessage.includes('local') || lowerMessage.includes('endereço') || lowerMessage.includes('endereco')) {
    return "Atendemos em Sertanópolis-PR e região. Para serviços em domicílio, podemos agendar uma visita técnica.";
  }
  
  if (lowerMessage.includes('horário') || lowerMessage.includes('horario') || lowerMessage.includes('funciona')) {
    return "Nosso horário de atendimento é de segunda a sexta das 8h às 18h, e sábados das 8h às 12h.";
  }
  
  return "Entendi sua solicitação. Para informações mais detalhadas, sugiro entrar em contato diretamente pelo WhatsApp ou preencher nosso formulário de contato.";
}

function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.querySelector('input').value;
  if (email && email.includes('@')) {
    showToast('Obrigado por assinar nossa newsletter!', 'success');
    this.querySelector('input').value = '';
  } else {
    showToast('Por favor, insira um e-mail válido.', 'error');
  }
});

const schemaScript = document.createElement('script');
schemaScript.type = 'application/ld+json';
schemaScript.text = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Técnico Soluções Inteligentes",
  "image": "https://www.tecnicotisolucoes.com/og-image.jpg",
  "telephone": "+5543991678501",
  "email": "contato@tecnicotisolucoes.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Sertanópolis",
    "addressRegion": "PR",
    "addressCountry": "BR"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "08:00",
      "closes": "12:00"
    }
  ],
  "priceRange": "$$",
  "serviceArea": {
    "@type": "Place",
    "name": "Sertanópolis e região"
  }
});
document.head.appendChild(schemaScript);

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');