/* ============================================
   التجمع الثالث - Main JavaScript
   ============================================ */

'use strict';

// ============================================
// NAVBAR
// ============================================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-close');
const mobileLinks = document.querySelectorAll('.mobile-menu .nav-link');

// Scroll effect
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Hamburger toggle
function openMobileMenu() {
  if (hamburger && mobileMenu) {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }
}

function closeMobileMenu() {
  if (hamburger && mobileMenu) {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }
}

if (hamburger) hamburger.addEventListener('click', openMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ============================================
// ACTIVE NAV LINK
// ============================================
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const allLinks = document.querySelectorAll('.nav-link');
  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

setActiveNavLink();

// ============================================
// SCROLL REVEAL
// ============================================
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));
}

// ============================================
// BACK TO TOP
// ============================================
const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// SERVICES FILTER
// ============================================
const filterBtns = document.querySelectorAll('.filter-btn');
const serviceCards = document.querySelectorAll('.service-full-card');

if (filterBtns.length > 0 && serviceCards.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      serviceCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ============================================
// CONTACT FORM VALIDATION
// ============================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const successMsg = document.getElementById('formSuccess');

  function showError(input, errorId, message) {
    input.classList.add('error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(input, errorId) {
    input.classList.remove('error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = '';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Live validation
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 2) clearError(nameInput, 'nameError');
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (validateEmail(emailInput.value.trim())) clearError(emailInput, 'emailError');
    });
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      if (messageInput.value.trim().length >= 10) clearError(messageInput, 'messageError');
    });
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!nameInput || nameInput.value.trim().length < 2) {
      showError(nameInput, 'nameError', 'يرجى إدخال اسمك الكامل (حرفان على الأقل)');
      valid = false;
    } else {
      clearError(nameInput, 'nameError');
    }

    if (!emailInput || !validateEmail(emailInput.value.trim())) {
      showError(emailInput, 'emailError', 'يرجى إدخال بريد إلكتروني صحيح');
      valid = false;
    } else {
      clearError(emailInput, 'emailError');
    }

    if (!messageInput || messageInput.value.trim().length < 10) {
      showError(messageInput, 'messageError', 'يرجى كتابة رسالتك (10 أحرف على الأقل)');
      valid = false;
    } else {
      clearError(messageInput, 'messageError');
    }

    if (valid) {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';
      }

      setTimeout(() => {
        contactForm.reset();
        if (successMsg) successMsg.classList.add('show');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الرسالة';
        }
        setTimeout(() => {
          if (successMsg) successMsg.classList.remove('show');
        }, 6000);
      }, 1200);
    }
  });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================
// FADE IN KEYFRAME (injected)
// ============================================
const style = document.createElement('style');
style.textContent = `S
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// ============================================
// أداة الذكاء الاصطناعي (ضُفْدَعِي)
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const frogButton = document.getElementById("frog-button");
  const chatWindow = document.getElementById("frog-chat-window");
  const closeChatBtn = document.getElementById("close-chat-btn");
  const sendBtn = document.getElementById("send-btn");
  const chatInput = document.getElementById("chat-input");
  const chatBody = document.getElementById("chat-body");

  // تأكد من وجود العناصر في الصفحة لتجنب الأخطاء في الصفحات التي لا تحتوي على الضفدع
  if (!frogButton || !chatWindow) return;

  // فتح وإغلاق النافذة عند الضغط على الضفدع
  frogButton.addEventListener("click", function () {
    chatWindow.classList.toggle("hidden");
    if (!chatWindow.classList.contains("hidden")) {
        // التركيز على حقل الكتابة تلقائياً عند فتح النافذة
        chatInput.focus();
    }
  });

  // إغلاق النافذة من زر X
  closeChatBtn.addEventListener("click", function () {
    chatWindow.classList.add("hidden");
  });

  // وظيفة إرسال الرسالة
  function sendMessage() {
    const text = chatInput.value.trim();
    if (text === "") return;

    // إضافة رسالة المستخدم
    appendMessage(text, "user-message");
    chatInput.value = "";

    // محاكاة تفكير الذكاء الاصطناعي
    setTimeout(() => {
      // يمكنك لاحقاً ربط هذا الجزء بـ API حقيقي للذكاء الاصطناعي
      const responses = [
          "واك واك! 🐸 أهلاً بك في التجمع الثالث.",
          "كيف يمكنني مساعدتك اليوم؟ 🐸",
          "سؤال رائع! جاري تطوير عقلي لأجيبك بالتفصيل قريباً. 🐸",
          "أنا ضُفدعي الذكي، صديقك في هذا الموقع! 🐸"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      appendMessage(randomResponse, "ai-message");
    }, 1200);
  }

  // إضافة الرسالة إلى واجهة الدردشة
  function appendMessage(text, className) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${className}`;
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    // التمرير للأسفل لرؤية أحدث رسالة
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // إرسال الرسالة عند الضغط على زر "إرسال"
  if (sendBtn) {
      sendBtn.addEventListener("click", sendMessage);
  }

  // إرسال الرسالة عند الضغط على زر Enter في لوحة المفاتيح
  if (chatInput) {
      chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          sendMessage();
        }
      });
  }
});
