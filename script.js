const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// KPI count-up
const numberObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) {
      el.textContent = target.toLocaleString(undefined, { maximumFractionDigits: target % 1 ? 1 : 0 }) + suffix;
    } else {
      const duration = 1200;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString(undefined, { maximumFractionDigits: target % 1 ? 1 : 0 }) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    numberObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => numberObserver.observe(el));

// Ambient network canvas
if (!reduceMotion) {
  const canvas = document.getElementById('data-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr, nodes;
  const pointer = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(35, Math.min(82, Math.floor((w * h) / 22000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
      r: Math.random() * 1.5 + .6
    }));
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
      const dx = n.x - pointer.x, dy = n.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 130) { n.x += dx / Math.max(dist, 1) * .35; n.y += dy / Math.max(dist, 1) * .35; }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(99,214,255,${(1 - d / 120) * .16})`;
          ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(145,225,255,.52)';
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; });
  window.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
  resize(); animate();
}

document.getElementById('year').textContent = new Date().getFullYear();
