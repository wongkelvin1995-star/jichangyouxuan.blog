/* 金色能量轨迹：鼠标移动时在身后撒出随机小星星（仅精细指针设备；尊重“减少动态效果”） */
(function () {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var layer = document.createElement('div'); layer.className = 'orb-layer'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer);
  var pool = [], MAX = 28, lx = -99, ly = -99, k = 0;
  var colors = ['#ffc400', '#ff7a00', '#fff1b8', '#ffd34d', '#3fa9ff'];
  for (var i = 0; i < MAX; i++) { var s = document.createElement('i'); s.className = 'orb-star'; layer.appendChild(s); pool.push(s); }
  function spawn(x, y) {
    var s = pool[k++ % MAX], size = 6 + Math.random() * 10, ang = Math.random() * 6.283, dist = 14 + Math.random() * 26;
    s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;color:' + colors[(Math.random() * colors.length) | 0] +
      ';--dx:' + (Math.cos(ang) * dist).toFixed(0) + 'px;--dy:' + (Math.sin(ang) * dist + 18).toFixed(0) + 'px;--r:' + ((Math.random() * 180) | 0) + 'deg;animation:none';
    void s.offsetWidth; s.style.animation = 'orbStar ' + (0.6 + Math.random() * 0.5).toFixed(2) + 's ease-out forwards';
  }
  addEventListener('pointermove', function (e) {
    var dx = e.clientX - lx, dy = e.clientY - ly;
    if (dx * dx + dy * dy < 400) return; lx = e.clientX; ly = e.clientY;
    spawn(e.clientX, e.clientY); if (Math.random() < 0.35) spawn(e.clientX, e.clientY);
  }, { passive: true });
})();
