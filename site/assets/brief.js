// "Tell us your idea": turns the form in #brief into a chat, one question at a time, and sends the
// answers as JSON to the address in its data-endpoint (a Supabase edge function; the contract is
// in README.md). It is the site's only script. Without it the same form shows every question at
// once and sends them as an email. If sending fails, or no endpoint is set, it offers that email
// and WhatsApp, already filled in with the answers. The markup comes from briefForm() in
// scripts/build.mjs; the strings in the page's language, from #brief-strings.
(() => {
  const root = document.getElementById('brief');
  if (!root || !window.fetch) return;
  const form = root.querySelector('form.brief');
  const S = JSON.parse(document.getElementById('brief-strings').textContent);
  const steps = [...form.querySelectorAll('fieldset.q')];
  const done = root.querySelector('.chat-done');
  const fail = root.querySelector('.chat-fail');
  let at = 0;
  let pointer = 0;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  form.noValidate = true;
  root.classList.add('is-chat');

  // Each answered question shows the answer as the visitor's own bubble.
  for (const step of steps) step.append(el('p', 'bubble me'));

  const bar = el('div', 'chat-controls');
  const back = el('button', 'btn ghost chat-back', S.back);
  const skip = el('button', 'btn ghost chat-skip', S.skip);
  const next = el('button', 'btn primary chat-next', S.next);
  back.type = 'button';
  skip.type = 'button';
  next.type = 'submit';
  bar.append(back, skip, next);
  form.append(bar);

  const fields = (step) => [...step.querySelectorAll('input, textarea')];
  const value = (step) => {
    const [first] = fields(step);
    if (first.type === 'radio') return step.querySelector('input:checked')?.value ?? '';
    if (first.type === 'checkbox') return first.checked;
    return first.value.trim();
  };
  // What the visitor sees, and what the fallback email says, for an answer.
  const answer = (step) => {
    const checked = step.querySelector('input[type=radio]:checked');
    if (checked) return checked.nextElementSibling.textContent;
    const v = value(step);
    return typeof v === 'boolean' ? (v ? '✓' : '') : v || '—';
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[\d\s().-]+$/;
  function problem(step) {
    const key = step.dataset.key;
    const [first] = fields(step);
    const v = value(step);
    if (first.type === 'radio') return v ? '' : S.errors.choose;
    if (first.type === 'checkbox') return v ? '' : S.errors.consent;
    const min = Number(step.dataset.min || 0);
    const max = Number(step.dataset.max || Infinity);
    if (!v) return 'optional' in step.dataset ? '' : S.errors.required;
    if (v.length > max) return S.errors.long;
    if (v.length < min) return key === 'idea' ? S.errors.short : S.errors.required;
    if (key === 'contacto') {
      const digits = v.replace(/\D/g, '').length;
      if (!EMAIL_RE.test(v) && !(PHONE_RE.test(v) && digits >= 7 && digits <= 15)) return S.errors.contacto;
    }
    return '';
  }
  function check(step) {
    const p = problem(step);
    step.querySelector('.q-error').textContent = p;
    for (const f of fields(step)) f.setAttribute('aria-invalid', p ? 'true' : 'false');
    return !p;
  }

  function show(i, focus) {
    at = i;
    steps.forEach((step, k) => {
      step.classList.toggle('done', k < i);
      step.classList.toggle('active', k === i);
      step.disabled = k > i;
      if (k < i) step.querySelector('.bubble.me').textContent = answer(step);
    });
    const step = steps[i];
    back.hidden = i === 0;
    skip.hidden = !('optional' in step.dataset);
    next.textContent = i === steps.length - 1 ? S.send : S.next;
    root.style.setProperty('--progress', String(i / steps.length));
    if (focus) {
      const target = step.querySelector('input:checked') || fields(step)[0];
      target.focus({ preventScroll: true });
      // Like a chat: the conversation scrolls inside its card, never the page.
      form.scrollTop = form.scrollHeight;
    }
  }

  function forward() {
    if (!check(steps[at])) {
      fields(steps[at])[0].focus();
      return;
    }
    if (at < steps.length - 1) show(at + 1, true);
    else send();
  }

  back.addEventListener('click', () => show(at - 1, true));
  skip.addEventListener('click', () => {
    for (const f of fields(steps[at])) f.value = '';
    steps[at].querySelector('.q-error').textContent = '';
    show(at + 1, true);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    forward();
  });
  // A tap or click on an option answers and moves on, like a chat. Arrow keys only select, so
  // keyboard users move on with Enter or the button.
  form.addEventListener('pointerdown', () => (pointer = Date.now()));
  form.addEventListener('change', (e) => {
    const step = e.target.closest('fieldset.q');
    if (step !== steps[at] || !/^(radio|checkbox)$/.test(e.target.type)) return;
    check(step);
    if (e.target.type === 'radio' && Date.now() - pointer < 1500) setTimeout(forward, 220);
  });
  // A shown error goes away as soon as the answer is good. Only while typing, so the layout never
  // moves under a click on the button.
  form.addEventListener('input', (e) => {
    const step = e.target.closest('fieldset.q');
    if (step === steps[at] && step.querySelector('.q-error').textContent && !problem(step)) check(step);
  });
  // The answer bubbles of earlier questions lead back to them.
  form.addEventListener('click', (e) => {
    const bubble = e.target.closest('.q.done .bubble.me');
    if (bubble) show(steps.indexOf(bubble.closest('.q')), true);
  });

  // The answers as text, for the email and WhatsApp fallbacks.
  const summary = () =>
    steps
      .filter((s) => s.dataset.key !== 'consentimiento')
      .map((s) => `${s.dataset.label}: ${answer(s)}`)
      .join('\n');

  function fallback(why) {
    const text = summary();
    fail.querySelector('.fail-why').textContent = why;
    fail.querySelector('.fail-mail').href = `mailto:${S.email}?subject=${encodeURIComponent(S.mailSubject)}&body=${encodeURIComponent(`${text}\n`)}`;
    fail.querySelector('.fail-wa').href = `https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(`${S.mailSubject}\n\n${text}`)}`;
    finish(fail);
  }

  function finish(panel) {
    form.hidden = true;
    panel.hidden = false;
    root.style.setProperty('--progress', '1');
    panel.focus();
  }

  async function send() {
    const data = Object.fromEntries(steps.map((s) => [s.dataset.key, value(s)]));
    const body = {
      nombre: data.nombre,
      contacto: data.contacto,
      empresa: data.empresa,
      idea: data.idea,
      tipo: data.tipo,
      plazo: data.plazo,
      presupuesto: data.presupuesto,
      idioma: document.documentElement.lang === 'en' ? 'en' : 'es',
      nda: data.nda === 'si',
      consentimiento: data.consentimiento === true,
      sitio: form.elements.sitio.value,
    };
    const endpoint = form.dataset.endpoint;
    if (!endpoint) return fallback('');

    next.disabled = true;
    back.disabled = true;
    next.textContent = S.sending;
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 15000);
    let status = 0;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: timeout.signal,
      });
      status = res.status;
    } catch {
      status = 0;
    } finally {
      clearTimeout(timer);
      next.disabled = false;
      back.disabled = false;
      next.textContent = S.send;
    }
    if (status >= 200 && status < 300) {
      const title = done.querySelector('.thanks-title');
      title.textContent = title.dataset.template.replace('{nombre}', body.nombre.split(/\s+/)[0]);
      finish(done);
    } else if (status === 400) fallback(S.fail.datos);
    else if (status === 429) fallback(S.fail.limite);
    else fallback(S.fail.red);
  }

  show(0, false);
})();
