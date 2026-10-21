/* The complete guide is in HTML; scripts only add search and copying. */
(() => {
  const sections = [...document.querySelectorAll('.guide-section')];
  const input = document.querySelector('#guide-search');
  const clear = document.querySelector('#clear-search');
  const status = document.querySelector('#search-status');
  const progress = document.querySelector('.reading-progress');
  const toast = document.querySelector('.toast');
  let toastTimer;
  const announce = text => {
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
  };
  const search = () => {
    const query = input.value.trim().toLocaleLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    let count = 0;
    sections.forEach(section => {
      const match = words.every(word => section.textContent.toLocaleLowerCase().includes(word));
      section.hidden = !match;
      const tocLink = document.querySelector(`[data-toc="${section.id}"]`);
      if (tocLink) tocLink.hidden = !match;
      if (match) count += 1;
      if (query && match) section.querySelectorAll('details').forEach(d => {d.open = true;});
    });
    clear.hidden = !query;
    status.hidden = !query;
    status.textContent = count ? `找到 ${count} 个相关章节。` : '本页没有匹配内容。可换个词，或到页首功能索引查找。';
  };
  input?.addEventListener('input', search);
  clear?.addEventListener('click', () => {input.value = ''; search(); input.focus();});
  const copy = async text => {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const field = document.createElement('textarea');
    field.value = text; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.top = '-9999px';
    document.body.appendChild(field); field.select(); const copied = document.execCommand('copy'); field.remove();
    if (!copied) throw new Error('Clipboard unavailable');
  };
  document.querySelectorAll('.copy-button, .copy-keywords').forEach(button => button.addEventListener('click', async () => {
    const keyword = button.classList.contains('copy-keywords');
    const text = keyword ? button.closest('.term').querySelector('.keyword-text').textContent : button.closest('.example').querySelector('blockquote').textContent;
    try {await copy(text); announce(keyword ? '检索词已复制' : '示例已复制');}
    catch {announce('请选中文字后复制');}
  }));
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
  };
  addEventListener('scroll', updateProgress, {passive:true}); addEventListener('resize', updateProgress); updateProgress();
  const updateToc = () => {
    const visible = sections.filter(section => !section.hidden);
    const current = visible.filter(section => section.getBoundingClientRect().top <= 70).pop() || visible[0];
    document.querySelectorAll('[data-toc]').forEach(a => {
      const active = Boolean(current && a.dataset.toc === current.id);
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', updateToc, {passive:true});
  input?.addEventListener('input', updateToc);
  clear?.addEventListener('click', updateToc);
  updateToc();
  const toc = document.querySelector('.toc details');
  if (toc && matchMedia('(max-width:760px)').matches) toc.open = false;
})();
