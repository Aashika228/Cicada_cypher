/* ============================================
   CONVERSATIONAL UX AUDITOR — INTERACTIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Scroll-triggered animations ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-in').forEach((el) => observer.observe(el));

  // --- Nav scroll effect ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // --- Mobile nav ---
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  document.querySelectorAll('.mobile-nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // --- Counter animation ---
  const counters = document.querySelectorAll('.hero__stat-number');
  let counterAnimated = false;

  function animateCounters() {
    if (counterAnimated) return;
    counterAnimated = true;

    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.count, 10);
      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(eased * target);

        if (target >= 1000) {
          counter.textContent = current.toLocaleString() + '+';
        } else {
          counter.textContent = current + '%';
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    });
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsEl = document.querySelector('.hero__stats');
  if (statsEl) statsObserver.observe(statsEl);

  // --- URL input suggestions ---
  document.querySelectorAll('.hero__suggestion').forEach((suggestion) => {
    suggestion.addEventListener('click', () => {
      const url = suggestion.dataset.url;
      document.getElementById('urlInput').value = url;
      document.getElementById('urlInputContainer').classList.add('has-value');
    });
  });

  // --- Audit button click → open modal ---
  const auditBtn = document.getElementById('auditBtn');
  const auditModal = document.getElementById('auditModal');
  const auditModalClose = document.getElementById('auditModalClose');
  const auditModalUrl = document.getElementById('auditModalUrl');
  const auditProgressBar = document.getElementById('auditProgressBar');
  const btnStart = document.getElementById('btnStart');

  function openAuditModal() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
      const inputContainer = document.getElementById('urlInputContainer');
      inputContainer.style.animation = 'shake 0.5s ease';
      setTimeout(() => (inputContainer.style.animation = ''), 500);
      return;
    }

    auditModalUrl.textContent = url;
    auditModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    simulateAudit();
  }

  if (auditBtn) auditBtn.addEventListener('click', openAuditModal);

  // Also trigger audit on Enter key
  const urlInput = document.getElementById('urlInput');
  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openAuditModal();
    });
  }

  // Start Audit button in nav
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      document.getElementById('urlInput').focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Close modal
  if (auditModalClose) {
    auditModalClose.addEventListener('click', () => {
      auditModal.classList.remove('open');
      document.body.style.overflow = '';
      resetAuditModal();
    });
  }

  auditModal.addEventListener('click', (e) => {
    if (e.target === auditModal) {
      auditModal.classList.remove('open');
      document.body.style.overflow = '';
      resetAuditModal();
    }
  });

  // Simulate audit progress
  function simulateAudit() {
    const pipeline = document.getElementById('auditPipeline');
    const steps = pipeline.querySelectorAll('.workflow__step');
    const statusText = document.getElementById('auditStatus');
    let currentStep = 0;
    const totalSteps = steps.length;
    const delayPerStep = 1500;
    
    pipeline.classList.add('animating');

    const statuses = [
      "Launching browser automation...",
      "Extracting DOM, CSS, and interactive elements...",
      "Validating against WCAG 2.1 & Usability Heuristics...",
      "Simulating 6 user journeys for friction points...",
      "Generating code fixes with AI...",
      "Verifying fixes and finalizing report..."
    ];

    function advanceStep() {
      if (currentStep > 0) {
        steps[currentStep - 1].classList.remove('active');
        steps[currentStep - 1].classList.add('done');
      }

      if (currentStep < totalSteps) {
        steps[currentStep].classList.add('active');
        if (statusText) statusText.textContent = statuses[currentStep];

        const progress = ((currentStep + 1) / totalSteps) * 100;
        if (auditProgressBar) auditProgressBar.style.width = progress + '%';

        currentStep++;
        setTimeout(advanceStep, delayPerStep);
      } else {
        // All done
        pipeline.classList.remove('animating');
        if (auditProgressBar) auditProgressBar.style.width = '100%';
        const title = document.querySelector('.audit-modal__title');
        if (title) {
          title.innerHTML = '✅ Audit Complete!';
          title.style.color = 'var(--accent-emerald)';
        }
        if (statusText) statusText.textContent = "Redirecting to your dashboard...";
      }
    }

    advanceStep();
  }

  function resetAuditModal() {
    const pipeline = document.getElementById('auditPipeline');
    if (pipeline) pipeline.classList.remove('animating');
    
    const steps = document.querySelectorAll('#auditPipeline .workflow__step');
    steps.forEach((step) => {
      step.classList.remove('active', 'done');
    });
    if (auditProgressBar) auditProgressBar.style.width = '0%';
    const title = document.querySelector('.audit-modal__title');
    if (title) {
      title.innerHTML = 'From URL to <span class="text-gradient">Verified Fixes</span>';
      title.style.color = '';
    }
    const statusText = document.getElementById('auditStatus');
    if (statusText) statusText.textContent = "Initializing...";
  }

  // --- Workflow steps hover animation ---
  const workflowSteps = document.querySelectorAll('.workflow__step');
  workflowSteps.forEach((step) => {
    step.addEventListener('mouseenter', () => {
      workflowSteps.forEach((s) => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  // Auto-animate workflow steps
  let activeWorkflowStep = 0;
  setInterval(() => {
    workflowSteps.forEach((s) => s.classList.remove('active'));
    workflowSteps[activeWorkflowStep].classList.add('active');
    activeWorkflowStep = (activeWorkflowStep + 1) % workflowSteps.length;
  }, 2500);

  // --- Chat demo typing effect ---
  const chatSuggestions = document.querySelectorAll('.chat-demo__suggestion');
  const chatInput = document.querySelector('.chat-demo__input');

  chatSuggestions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      chatInput.value = '';
      let i = 0;
      function type() {
        if (i < text.length) {
          chatInput.value += text[i];
          i++;
          setTimeout(type, 30);
        }
      }
      type();
    });
  });

  // --- Journey meter animation on scroll ---
  const journeyCards = document.querySelectorAll('.journey-card');
  const journeyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.journey-card__meter-fill');
          if (fill) {
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
              fill.style.width = width;
            }, 200);
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  journeyCards.forEach((card) => journeyObserver.observe(card));

  // --- Input glow animation on focus ---
  const heroInputContainer = document.getElementById('urlInputContainer');
  const heroInput = document.getElementById('urlInput');

  heroInput.addEventListener('focus', () => {
    heroInputContainer.style.boxShadow = '0 0 40px rgba(129,140,248,0.15)';
  });

  heroInput.addEventListener('blur', () => {
    heroInputContainer.style.boxShadow = '';
  });

  // --- Shake animation CSS ---
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 50%, 90% { transform: translateX(-4px); }
      30%, 70% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);

  // --- Parallax subtle effect on hero ---
  window.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

    document.querySelectorAll('.bg-glow').forEach((glow, i) => {
      const factor = (i + 1) * 0.5;
      glow.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
    });
  });

  // --- Preview ring animation restart on scroll ---
  const previewEl = document.querySelector('.hero__preview');
  if (previewEl) {
    const previewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rings = entry.target.querySelectorAll('.preview-ring__fill');
            rings.forEach((ring) => {
              ring.style.animation = 'none';
              ring.offsetHeight; // trigger reflow
              ring.style.animation = 'ringFill 2s ease-out forwards';
            });

            const bars = entry.target.querySelectorAll('.preview-bar-fill');
            bars.forEach((bar) => {
              bar.style.animation = 'none';
              bar.offsetHeight;
              bar.style.animation = 'barGrow 1.5s ease-out forwards';
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    previewObserver.observe(previewEl);
  }
});
