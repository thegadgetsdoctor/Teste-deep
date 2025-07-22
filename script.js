// ========== FUNÇÕES GERAIS ==========

// Função para esconder a página de manutenção
function hideMaintenance() {
  document.getElementById('maintenanceOverlay').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Verifica se o usuário já viu a mensagem de manutenção
if (!localStorage.getItem('maintenanceSeen')) {
  document.body.style.overflow = 'hidden';
} else {
  document.getElementById('maintenanceOverlay').style.display = 'none';
}

// Quando o usuário clica para continuar, marca como visto
document.querySelector('.maintenance-btn.continue').addEventListener('click', function() {
  localStorage.setItem('maintenanceSeen', 'true');
});

// Redireciona para o WhatsApp com mensagem pré-definida
function redirectToWhatsApp(service) {
  const message = `Olá, gostaria de informações sobre ${service}`;
  window.open(`https://wa.me/5543991678501?text=${encodeURIComponent(message)}`, '_blank');
}

// ========== ANIMAÇÃO DE SCROLL ==========
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  // Observa todas as seções
  document.querySelectorAll('.section').forEach(section => observer.observe(section));
} else {
  // Fallback para navegadores sem suporte a IntersectionObserver
  document.querySelectorAll('.section').forEach(section => section.classList.add('visible'));
}

// ========== NAVEGAÇÃO SUAVE ==========
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

// ========== CONTROLE DOS BOTÕES FLUTUANTES ==========
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');
  let current = '';
  
  // Atualiza a navegação ativa conforme o scroll
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
  
  // Controle dos botões flutuantes
  const floatingBtns = document.querySelector('.floating-btns');
  const backTopBtn = document.querySelector('.floating-btn.back-top');
  const appointmentBtn = document.querySelector('.floating-btn.appointment');
  
  // Mostra os botões flutuantes apenas após o usuário começar a rolar
  if (window.scrollY > 100) {
    floatingBtns.classList.add('visible');
  } else {
    floatingBtns.classList.remove('visible');
  }
  
  // Mostra/oculta botões específicos conforme a posição do scroll
  if (window.scrollY > 300) {
    backTopBtn.style.display = 'flex';
    appointmentBtn.style.display = 'flex';
  } else {
    backTopBtn.style.display = 'none';
    appointmentBtn.style.display = 'none';
  }
});

// ========== ALTERNAR TEMA (CLARO/ESCURO) ==========
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

// Verifica o tema salvo no localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.setAttribute('data-theme', 'dark');
  document.getElementById('theme-icon').className = 'fas fa-sun';
}

// ========== FORMULÁRIO DE CONTATO ==========
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
  const formGroups = contactForm.querySelectorAll('.form-group');
  const formFeedback = document.getElementById('form-feedback');
  
  // Adiciona validação em tempo real para cada campo
  formGroups.forEach(group => {
    const input = group.querySelector('.form-control');
    input.addEventListener('input', () => {
      validateField(group, input);
    });
  });
  
  // Formata o número de telefone
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
  
  // Envio do formulário
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Valida todos os campos antes do envio
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
  
  // Validação de campos individuais
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

// ========== SLIDER DE DEPOIMENTOS ==========
const testimonialSlider = document.getElementById('testimonialSlider');
const prevBtn = document.getElementById('prevTestimonial');
const nextBtn = document.getElementById('nextTestimonial');
let currentSlide = 0;
const slideCount = testimonialSlider.children.length;

// Mostra um slide específico
function showSlide(index) {
  if (index < 0) index = slideCount - 1;
  if (index >= slideCount) index = 0;
  testimonialSlider.style.transform = `translateX(-${index * 100}%)`;
  currentSlide = index;
}

// Navegação entre slides
prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

// Auto-play (avança a cada 5 segundos)
setInterval(() => showSlide(currentSlide + 1), 5000);

// ========== FAQ (ACORDEÃO) ==========
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});

// ========== MODAL DE AGENDAMENTO ==========
const appointmentModal = document.getElementById('appointmentModal');
const appointmentForm = document.getElementById('appointmentForm');

function openAppointmentModal() {
  appointmentModal.style.display = 'flex';
}

function closeAppointmentModal() {
  appointmentModal.style.display = 'none';
}

// Fecha o modal ao clicar no X ou fora do conteúdo
document.querySelector('.close-modal').addEventListener('click', closeAppointmentModal);
appointmentModal.addEventListener('click', (e) => {
  if (e.target === appointmentModal) closeAppointmentModal();
});

// Envio do formulário de agendamento
appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('appointment-name').value;
  const phone = document.getElementById('appointment-phone').value;
  const service = document.getElementById('appointment-service').value;
  const date = document.getElementById('appointment-date').value;
  
  // Validação básica
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

// ========== MODAL DE DETALHES DO SERVIÇO ==========
const serviceModal = document.getElementById('serviceModal');
let currentService = '';

// Dados detalhados dos serviços
const servicesData = {
  manutencao: {
    title: "Manutenção de Celulares",
    icon: '<i class="fas fa-mobile-alt" aria-hidden="true"></i>',
    description: "Soluções completas para seu dispositivo móvel, desde reparos simples até problemas complexos.",
    details: `
      <p>Oferecemos serviços especializados para diversos modelos e marcas de celulares, com peças de qualidade e garantia de 90 dias.</p>
      
      <h3>Serviços Incluídos</h3>
      <ul>
        <li>Troca de telas e vidros</li>
        <li>Substituição de baterias</li>
        <li>Reparo de conectores de carga</li>
        <li>Conserto de botões e microfones</li>
        <li>Limpeza interna completa</li>
        <li>Recuperação de dados</li>
        <li>Desbloqueio e liberação</li>
      </ul>
      
      <div class="service-modal-pricing">
        <div class="pricing-card">
          <div class="pricing-title">Serviço Básico</div>
          <div class="pricing-price">R$ 100 - R$ 300</div>
          <ul class="pricing-features">
            <li>Troca de bateria</li>
            <li>Limpeza interna</li>
            <li>Reparo de conectores</li>
            <li>Garantia de 90 dias</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Serviço Intermediário</div>
          <div class="pricing-price">R$ 200 - R$ 500</div>
          <ul class="pricing-features">
            <li>Troca de tela LCD</li>
            <li>Substituição de módulo de câmera</li>
            <li>Reparo de placa lógica básico</li>
            <li>Garantia de 90 dias</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Serviço Avançado</div>
          <div class="pricing-price">R$ 300 - R$ 800</div>
          <ul class="pricing-features">
            <li>Troca de tela OLED</li>
            <li>Reparo avançado de placa lógica</li>
            <li>Recuperação de dados</li>
            <li>Garantia de 120 dias</li>
          </ul>
        </div>
      </div>
    `
  },
  informatica: {
    title: "Suporte em Informática",
    icon: '<i class="fas fa-laptop" aria-hidden="true"></i>',
    description: "Soluções completas para computadores, notebooks e periféricos.",
    details: `
      <p>Oferecemos serviços especializados para diversos modelos e marcas de computadores e notebooks, com peças de qualidade e garantia de 90 dias.</p>
      
      <h3>Serviços Incluídos</h3>
      <ul>
        <li>Formatação e instalação de sistemas operacionais</li>
        <li>Remoção de vírus e malware</li>
        <li>Otimização de desempenho</li>
        <li>Substituição de componentes</li>
        <li>Recuperação de dados</li>
        <li>Configuração de redes locais</li>
        <li>Suporte remoto e presencial</li>
      </ul>
      
      <div class="service-modal-pricing">
        <div class="pricing-card">
          <div class="pricing-title">Serviço Básico</div>
          <div class="pricing-price">R$ 150 - R$ 250</div>
          <ul class="pricing-features">
            <li>Formatação e instalação de SO</li>
            <li>Remoção de vírus</li>
            <li>Otimização básica</li>
            <li>Garantia de 30 dias</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Serviço Intermediário</div>
          <div class="pricing-price">R$ 200 - R$ 400</div>
          <ul class="pricing-features">
            <li>Substituição de HD/SSD</li>
            <li>Upgrade de memória RAM</li>
            <li>Limpeza interna completa</li>
            <li>Garantia de 60 dias</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Serviço Avançado</div>
          <div class="pricing-price">R$ 300 - R$ 600</div>
          <ul class="pricing-features">
            <li>Reparo de placa-mãe</li>
            <li>Substituição de tela de notebook</li>
            <li>Recuperação de dados</li>
            <li>Garantia de 90 dias</li>
          </ul>
        </div>
      </div>
    `
  },
  redes: {
    title: "Redes e Infraestrutura",
    icon: '<i class="fas fa-network-wired" aria-hidden="true"></i>',
    description: "Soluções completas para redes de computadores em residências e empresas.",
    details: `
      <p>Implementamos e configuramos redes eficientes para garantir conectividade estável e segura para seu negócio ou residência.</p>
      
      <h3>Serviços Incluídos</h3>
      <ul>
        <li>Projeto e implementação de redes</li>
        <li>Cabeamento estruturado</li>
        <li>Configuração de roteadores e switches</li>
        <li>Otimização de Wi-Fi</li>
        <li>Soluções para grandes áreas</li>
        <li>Segurança de rede</li>
        <li>Monitoramento e manutenção contínua</li>
      </ul>
      
      <div class="service-modal-pricing">
        <div class="pricing-card">
          <div class="pricing-title">Residencial</div>
          <div class="pricing-price">R$ 500 - R$ 1.500</div>
          <ul class="pricing-features">
            <li>Instalação básica de rede</li>
            <li>Configuração de roteador</li>
            <li>Otimização de Wi-Fi</li>
            <li>Garantia de 1 ano</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Pequena Empresa</div>
          <div class="pricing-price">R$ 1.000 - R$ 3.000</div>
          <ul class="pricing-features">
            <li>Cabeamento estruturado</li>
            <li>Configuração de rede local</li>
            <li>Segurança básica</li>
            <li>Garantia de 1 ano</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Empresarial</div>
          <div class="pricing-price">R$ 2.500 - R$ 8.000</div>
          <ul class="pricing-features">
            <li>Infraestrutura completa</li>
            <li>Roteadores profissionais</li>
            <li>Sistemas de segurança avançada</li>
            <li>Monitoramento 24/7</li>
            <li>Garantia de 2 anos</li>
          </ul>
        </div>
      </div>
    `
  },
  cameras: {
    title: "Câmeras de Segurança",
    icon: '<i class="fas fa-video" aria-hidden="true"></i>',
    description: "Sistemas completos de vigilância para sua segurança.",
    details: `
      <p>Instalamos e configuramos sistemas de segurança com câmeras de alta qualidade para proteger seu patrimônio.</p>
      
      <h3>Serviços Incluídos</h3>
      <ul>
        <li>Projeto personalizado de segurança</li>
        <li>Instalação de câmeras IP e analógicas</li>
        <li>Configuração de DVR/NVR</li>
        <li>Acesso remoto via smartphone</li>
        <li>Sistemas de gravação em nuvem</li>
        <li>Manutenção preventiva</li>
        <li>Atualizações de firmware</li>
      </ul>
      
      <div class="service-modal-pricing">
        <div class="pricing-card">
          <div class="pricing-title">Kit Básico</div>
          <div class="pricing-price">R$ 800 - R$ 1.500</div>
          <ul class="pricing-features">
            <li>2 câmeras HD</li>
            <li>DVR básico</li>
            <li>Instalação básica</li>
            <li>Garantia de 1 ano</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Kit Intermediário</div>
          <div class="pricing-price">R$ 1.500 - R$ 3.000</div>
          <ul class="pricing-features">
            <li>4 câmeras Full HD</li>
            <li>DVR com armazenamento</li>
            <li>Acesso remoto</li>
            <li>Garantia de 2 anos</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Kit Premium</div>
          <div class="pricing-price">R$ 3.000 - R$ 8.000</div>
          <ul class="pricing-features">
            <li>8+ câmeras 4K</li>
            <li>NVR profissional</li>
            <li>Armazenamento em nuvem</li>
            <li>Monitoramento inteligente</li>
            <li>Garantia de 3 anos</li>
          </ul>
        </div>
      </div>
    `
  },
  sites: {
    title: "Desenvolvimento Web",
    icon: '<i class="fas fa-globe" aria-hidden="true"></i>',
    description: "Soluções digitais completas para sua presença online.",
    details: `
      <p>Criamos sites e sistemas web personalizados para atender às necessidades específicas do seu negócio.</p>
      
      <h3>Serviços Incluídos</h3>
      <ul>
        <li>Desenvolvimento de sites institucionais</li>
        <li>Lojas virtuais (e-commerce)</li>
        <li>Sistemas web personalizados</li>
        <li>Otimização para buscadores (SEO)</li>
        <li>Design responsivo</li>
        <li>Hospedagem e domínio</li>
        <li>Manutenção e suporte</li>
      </ul>
      
      <div class="service-modal-pricing">
        <div class="pricing-card">
          <div class="pricing-title">Site Institucional</div>
          <div class="pricing-price">R$ 1.500 - R$ 3.000</div>
          <ul class="pricing-features">
            <li>Até 5 páginas</li>
            <li>Design responsivo</li>
            <li>Formulário de contato</li>
            <li>Otimização básica SEO</li>
            <li>Suporte por 3 meses</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">E-commerce</div>
          <div class="pricing-price">R$ 3.000 - R$ 8.000</div>
          <ul class="pricing-features">
            <li>Catálogo de produtos</li>
            <li>Carrinho de compras</li>
            <li>Integração com pagamentos</li>
            <li>Painel administrativo</li>
            <li>Suporte por 6 meses</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Sistema Personalizado</div>
          <div class="pricing-price">R$ 5.000 - R$ 15.000+</div>
          <ul class="pricing-features">
            <li>Desenvolvimento sob medida</li>
            <li>Integrações com APIs</li>
            <li>Banco de dados personalizado</li>
            <li>Treinamento de uso</li>
            <li>Suporte por 1 ano</li>
          </ul>
        </div>
      </div>
    `
  },
  personalizado: {
    title: "Soluções Personalizadas",
    icon: '<i class="fas fa-puzzle-piece" aria-hidden="true"></i>',
    description: "Serviços técnicos sob medida para necessidades específicas.",
    details: `
      <p>Desenvolvemos soluções técnicas personalizadas para atender demandas específicas que não se encaixam em categorias tradicionais.</p>
      
      <h3>Serviços Incluídos</h3>
      <ul>
        <li>Consultoria técnica especializada</li>
        <li>Soluções integradas multidisciplinares</li>
        <li>Desenvolvimento de projetos customizados</li>
        <li>Implantação de sistemas complexos</li>
        <li>Coordenação com outros profissionais</li>
        <li>Acompanhamento contínuo</li>
      </ul>
      
      <div class="service-modal-pricing">
        <div class="pricing-card">
          <div class="pricing-title">Consultoria</div>
          <div class="pricing-price">R$ 150/hora</div>
          <ul class="pricing-features">
            <li>Análise de necessidades</li>
            <li>Proposta de solução</li>
            <li>Plano de implementação</li>
            <li>Relatório técnico</li>
          </ul>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-title">Projeto Personalizado</div>
          <div class="pricing-price">Sob consulta</div>
          <ul class="pricing-features">
            <li>Levantamento de requisitos</li>
            <li>Desenvolvimento de solução</li>
            <li>Implantação completa</li>
            <li>Treinamento de usuários</li>
            <li>Suporte pós-implantação</li>
          </ul>
        </div>
      </div>
      
      <p><strong>Entre em contato</strong> para discutir sua necessidade específica e receber um orçamento personalizado.</p>
    `
  }
};

function openServiceModal(serviceId) {
  const service = servicesData[serviceId];
  if (!service) return;
  
  document.getElementById('service-modal-title').textContent = service.title;
  document.getElementById('service-modal-icon').innerHTML = service.icon;
  document.getElementById('service-modal-content').innerHTML = `
    <p>${service.description}</p>
    ${service.details}
  `;
  
  // Armazenar o serviço atual para o botão do WhatsApp
  currentService = service.title;
  
  // Exibir o modal
  serviceModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Rolar para o topo do modal
  document.querySelector('.service-modal-content').scrollTop = 0;
}

function closeServiceModal() {
  serviceModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
  if (e.target === serviceModal) closeServiceModal();
});

// Redirecionar para o WhatsApp com o serviço atual
function redirectToWhatsApp() {
  const message = `Olá, gostaria de solicitar um orçamento para ${currentService}`;
  window.open(`https://wa.me/5543991678501?text=${encodeURIComponent(message)}`, '_blank');
  closeServiceModal();
}

// ========== PÁGINA DE LOGIN ==========
const loginContainer = document.getElementById('loginContainer');
const loginForm = document.getElementById('loginForm');

function openLoginModal() {
  loginContainer.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  loginContainer.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function selectUserType(type) {
  document.querySelectorAll('.user-type-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.user-type-btn').classList.add('active');
}

function showRegister() {
  showToast('Funcionalidade de cadastro em desenvolvimento!', 'info');
}

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Validação básica
  if (!email || !password) {
    showToast('Por favor, preencha todos os campos.', 'error');
    return;
  }
  
  // Simulação de login
  showToast('Login realizado com sucesso!', 'success');
  setTimeout(() => {
    closeLoginModal();
  }, 2000);
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
  if (e.target === loginContainer) closeLoginModal();
});

// ========== NOTIFICAÇÕES (TOAST) ==========
function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

// ========== CHATBOT ==========
const chatbot = document.getElementById('chatbot');
const openChatBtn = document.getElementById('openChat');
const closeChatBtn = document.querySelector('.close-chat');
const chatInput = document.getElementById('chat-input');

// Abre/fecha o chatbot
openChatBtn.addEventListener('click', () => {
  chatbot.classList.add('active');
});

closeChatBtn.addEventListener('click', () => {
  chatbot.classList.remove('active');
});

// Envia mensagem ao pressionar Enter
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Envia mensagem ao clicar no botão
document.querySelector('.chat-input button').addEventListener('click', sendMessage);

// Função para enviar mensagem no chat
function sendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    const messagesContainer = document.querySelector('.chat-messages');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = message;
    messagesContainer.appendChild(userMessageDiv);
    chatInput.value = '';
    
    // Mostra indicador de "digitando"
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message';
    typingIndicator.textContent = 'Digitando...';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simula resposta após 1.5 segundos
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

// Gera respostas automáticas baseadas nas mensagens do usuário
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

// ========== NEWSLETTER ==========
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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Atribuir evento de clique aos cards de serviço
  document.querySelectorAll('.service-card').forEach(card => {
    const serviceId = card.dataset.service;
    card.addEventListener('click', () => openServiceModal(serviceId));
  });
});