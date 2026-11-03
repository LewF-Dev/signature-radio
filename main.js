/* ═══════════════════════════════════════════════════════
   Signature Radio UK — main.js
═══════════════════════════════════════════════════════ */



/* ── Ticker ───────────────────────────────────────────
   Measures the first ticker unit and sets the scroll
   distance as a CSS custom property so the loop is
   pixel-perfect at every screen size.
─────────────────────────────────────────────────────── */
(function initTicker() {
  function setup() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    const unit = track.querySelector('.ticker-unit');
    if (!unit) return;

    const unitWidth = unit.getBoundingClientRect().width;
    if (!unitWidth) return;

    // Speed: ~80px/s regardless of text length
    const duration = Math.round(unitWidth / 80);
    track.style.setProperty('--ticker-dist', '-' + unitWidth + 'px');
    track.style.setProperty('--ticker-duration', duration + 's');
  }

  // Run after layout; retry once if ticker hasn't injected yet
  if (document.readyState === 'complete') {
    requestAnimationFrame(setup);
  } else {
    window.addEventListener('load', function () { requestAnimationFrame(setup); });
  }
})();

/* ── Video player ─────────────────────────────────────
   Re-initialised when the router restores the homepage.
   Load metadata as the player approaches the viewport.
─────────────────────────────────────────────────────── */
window.SRUK = window.SRUK || {};
window.SRUK_initVideo = function initVideo() {
  if (typeof window.SRUK.cleanupVideo === 'function') window.SRUK.cleanupVideo();

  const container = document.getElementById('videoContainer');
  const video     = document.getElementById('stationVideo');
  const btn       = document.getElementById('videoPlayBtn');

  if (!container || !video) return;

  let videoLoadStarted = false;
  let videoObserver = null;
  function prepareVideo() {
    if (videoLoadStarted) return;
    videoLoadStarted = true;
    video.preload = 'metadata';
    video.load();
  }

  if ('IntersectionObserver' in window) {
    videoObserver = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        prepareVideo();
        videoObserver.disconnect();
      }
    }, { rootMargin: '500px 0px' });
    videoObserver.observe(container);
  } else {
    prepareVideo();
  }

  function play() {
    prepareVideo();
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(resetPlayingState);
  }

  function showPlayingState() {
    container.classList.add('playing');
    if (btn) btn.setAttribute('aria-label', 'Pause video');
  }

  function resetPlayingState() {
    container.classList.remove('playing');
    if (btn) btn.setAttribute('aria-label', 'Play video');
  }

  function pause() {
    video.pause();
    resetPlayingState();
  }

  function togglePlayback() {
    if (video.paused) { play(); } else { pause(); }
  }

  container.addEventListener('click', togglePlayback);
  video.addEventListener('playing', showPlayingState);
  video.addEventListener('pause', resetPlayingState);
  video.addEventListener('ended', resetPlayingState);
  video.addEventListener('error', resetPlayingState);

  window.SRUK.cleanupVideo = function () {
    if (videoObserver) videoObserver.disconnect();
    pause();
    container.removeEventListener('click', togglePlayback);
    video.removeEventListener('playing', showPlayingState);
    video.removeEventListener('pause', resetPlayingState);
    video.removeEventListener('ended', resetPlayingState);
    video.removeEventListener('error', resetPlayingState);
    window.SRUK.cleanupVideo = null;
  };
};
window.SRUK_initVideo();

/* ── Slideshow ────────────────────────────────────────
   Fade transition between slides. Auto-advances every 8s.
   Pauses on hover. Arrow keys, swipe, and dot navigation.
─────────────────────────────────────────────────────── */
window.SRUK = window.SRUK || {};
window.SRUK.cleanupSlideshow = null;

window.SRUK_initSlideshow = function initSlideshow() {
  // Clean up any previous instance before re-initialising
  if (window.SRUK.cleanupSlideshow) {
    window.SRUK.cleanupSlideshow();
    window.SRUK.cleanupSlideshow = null;
  }

  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  const slides   = Array.from(slideshow.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('slideshowDots');
  const prevBtn  = document.getElementById('slideshowPrev');
  const nextBtn  = document.getElementById('slideshowNext');
  const INTERVAL = 8000;
  const SWIPE_THRESHOLD = 40; // px

  if (!slides.length) return;

  let current = 0;
  let timer;
  let touchStartX = 0;

  function loadSlide(index) {
    const slide = slides[(index + slides.length) % slides.length];
    if (slide && slide.dataset.src && !slide.hasAttribute('src')) {
      slide.src = slide.dataset.src;
      slide.removeAttribute('data-src');
    }
  }

  loadSlide(0);
  loadSlide(1);

  // Build dot indicators
  const dots = slides.map(function (_, i) {
    const dot = document.createElement('button');
    dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function () { stopTimer(); goTo(i); startTimer(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    loadSlide(current + 1);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startTimer() {
    timer = setInterval(next, INTERVAL);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { stopTimer(); prev(); startTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { stopTimer(); next(); startTimer(); });

  // Pause auto-advance on hover
  slideshow.addEventListener('mouseenter', stopTimer);
  slideshow.addEventListener('mouseleave', startTimer);

  // Keyboard navigation
  slideshow.setAttribute('tabindex', '0');
  slideshow.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { stopTimer(); prev(); startTimer(); }
    if (e.key === 'ArrowRight') { stopTimer(); next(); startTimer(); }
  });

  // Swipe support
  slideshow.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  slideshow.addEventListener('touchend', function (e) {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    stopTimer();
    if (delta < 0) next(); else prev();
    startTimer();
  }, { passive: true });

  startTimer();

  // Expose cleanup so the router can stop the timer before swapping pages
  window.SRUK.cleanupSlideshow = stopTimer;
};
window.SRUK_initSlideshow();

/* ── Scroll Reveal ────────────────────────────────────
   Watches all .reveal elements and adds .is-visible
   when they enter the viewport.
─────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(function (el) { observer.observe(el); });
})();

/* ── Hero About Controls ───────────────────────────── */
(function initHeroAboutControls() {
  document.addEventListener('click', function (event) {
    const toggle = event.target.closest('#heroIntroToggle');
    if (toggle) {
      const panel = document.getElementById('heroIntroPanel');
      const intro = toggle.closest('.hero-intro');
      if (!panel || !intro) return;

      const isOpen = toggle.getAttribute('aria-expanded') !== 'true';
      const hero = intro.closest('.hero');
      const brand = intro.closest('.hero-brand');
      if (hero && isOpen && window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches) {
        hero.style.setProperty('--hero-phone-open-height', `${hero.getBoundingClientRect().height}px`);
        if (brand) brand.style.setProperty('--hero-phone-intro-top', `${intro.offsetTop}px`);
      } else if (hero && !isOpen) {
        hero.style.removeProperty('--hero-phone-open-height');
        brand?.style.removeProperty('--hero-phone-intro-top');
      }
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      panel.inert = !isOpen;
      intro.classList.toggle('is-open', isOpen);
      hero?.classList.toggle('about-open', isOpen);
      return;
    }

    const link = event.target.closest('#heroAboutLink');
    if (!link) return;
    if (link.getAttribute('href') !== '#about') return;

    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    event.preventDefault();
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    aboutSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
})();

/* ── Mobile Nav Toggle ────────────────────────────── */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  const phoneMenuPanel = document.getElementById('pagePhoneMenuPanel');

  if (!toggle || !links) return;

  function setNavOpen(isOpen) {
    links.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (phoneMenuPanel && links.parentNode === phoneMenuPanel) {
      phoneMenuPanel.classList.toggle('is-open', isOpen);
      phoneMenuPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      phoneMenuPanel.inert = !isOpen;
      document.body.classList.toggle('mobile-nav-open', isOpen);
    }
  }

  toggle.addEventListener('click', function () {
    setNavOpen(!links.classList.contains('open'));
  });

  // Close the overlay after a destination or presenter action is selected.
  links.addEventListener('click', function (event) {
    if (event.target.closest('a, #heroPhonePresenterSlot button')) setNavOpen(false);
  });

  if (phoneMenuPanel) {
    phoneMenuPanel.addEventListener('click', function (event) {
      if (event.target === phoneMenuPanel) setNavOpen(false);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && links.classList.contains('open')) setNavOpen(false);
  });
})();


/* Crossfade the previous photo crop into its new layout after a resize. */
window.SRUK = window.SRUK || {};
window.SRUK_initHeroImageTransition = function initHeroImageTransition() {
  if (typeof window.SRUK.cleanupHeroImageTransition === 'function') window.SRUK.cleanupHeroImageTransition();
  const hero = document.getElementById('siteHero');
  const frame = hero?.querySelector('.hero-image');
  const photo = frame?.querySelector('img');
  if (!photo) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let previousCrop = null;
  let snapshot = null;
  let settleTimer = 0;
  let incoming = null;
  let outgoing = null;
  let captureFrame = 0;

  function captureCrop() {
    const heroRect = hero.getBoundingClientRect();
    const photoRect = frame.getBoundingClientRect();
    if (!photoRect.width || !photoRect.height) return;
    const style = getComputedStyle(photo);
    previousCrop = {
      left: photoRect.left - heroRect.left,
      top: photoRect.top - heroRect.top,
      width: photoRect.width,
      height: photoRect.height,
      objectPosition: style.objectPosition,
      objectFit: style.objectFit,
      filter: style.filter,
      opacity: getComputedStyle(frame).opacity
    };
  }

  function resetTransition() {
    window.clearTimeout(settleTimer);
    incoming?.cancel();
    outgoing?.cancel();
    incoming = outgoing = null;
    snapshot?.remove();
    snapshot = null;
  }

  function resizePhoto() {
    if (!hero.isConnected) return;
    if (previousCrop) {
      const nextRect = frame.getBoundingClientRect();
      const widthChange = Math.abs(nextRect.width - previousCrop.width);
      const heightChange = Math.abs(nextRect.height - previousCrop.height);
      // iPad Safari can dispatch viewport resizes as its browser chrome moves
      // during scrolling. Keep the crop current for those small changes, but
      // reserve the crossfade for an actual orientation or layout change.
      if (widthChange < 24 && heightChange < 96) {
        if (snapshot) resetTransition();
        captureCrop();
        return;
      }
    }
    if (reducedMotion.matches || !previousCrop) {
      resetTransition();
      captureCrop();
      return;
    }
    window.clearTimeout(settleTimer);
    incoming?.cancel();
    outgoing?.cancel();
    if (!snapshot) {
      snapshot = document.createElement('div');
      snapshot.className = 'hero-image-resize-snapshot';
      snapshot.setAttribute('aria-hidden', 'true');
      for (const dimension of ['left', 'top', 'width', 'height']) {
        snapshot.style[dimension] = previousCrop[dimension] + 'px';
      }
      const frozenPhoto = photo.cloneNode(false);
      frozenPhoto.removeAttribute('id');
      Object.assign(frozenPhoto.style, {
        animation: 'none', opacity: '1',
        objectFit: previousCrop.objectFit,
        objectPosition: previousCrop.objectPosition,
        filter: previousCrop.filter
      });
      snapshot.appendChild(frozenPhoto);
      hero.appendChild(snapshot);
    }
    snapshot.style.opacity = previousCrop.opacity;
    const targetOpacity = getComputedStyle(frame).opacity;
    // Keep the old crop still while dragging or rotating, then reveal the new one.
    incoming = frame.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'both' });
    settleTimer = window.setTimeout(function () {
      incoming.cancel();
      const timing = { duration: 500, easing: 'ease-in-out', fill: 'both' };
      incoming = frame.animate([{ opacity: 0 }, { opacity: targetOpacity }], timing);
      outgoing = snapshot.animate([{ opacity: previousCrop.opacity }, { opacity: 0 }], timing);
      incoming.onfinish = function () {
        resetTransition();
        captureCrop();
      };
    }, 120);
  }

  captureFrame = window.requestAnimationFrame(captureCrop);
  const cropObserver = new ResizeObserver(function () {
    if (!snapshot) captureCrop();
  });
  cropObserver.observe(frame);
  window.addEventListener('resize', resizePhoto);
  reducedMotion.addEventListener('change', resizePhoto);
  window.SRUK.cleanupHeroImageTransition = function () {
    window.cancelAnimationFrame(captureFrame);
    cropObserver.disconnect();
    resetTransition();
    window.removeEventListener('resize', resizePhoto);
    reducedMotion.removeEventListener('change', resizePhoto);
    window.SRUK.cleanupHeroImageTransition = null;
  };
};
window.SRUK_initHeroImageTransition();

/* The same quiet, CSS-animated rain is used on every screen. */
window.SRUK_initHeroRain = function initHeroRain() {
  if (typeof window.SRUK.cleanupHeroRain === 'function') window.SRUK.cleanupHeroRain();
  const heroAmbient = document.getElementById('heroAmbientVisualizer');
  if (!heroAmbient) return;
  const hero = document.getElementById('siteHero');
  const tabletRain = document.body.classList.contains('tablet-layout') ||
    window.matchMedia('(min-width: 700px) and (max-width: 1366px) and (pointer: coarse)').matches;
  let currentColumnCount = 0;
  let visibilityObserver = null;
  function syncHeroRain() {
    const width = heroAmbient.clientWidth;
    if (!width) return;
    // Tablets get a lighter version of the same rain treatment. Their mobile
    // GPUs struggle with hundreds of independently animated, filtered layers.
    const rainColumnCount = tabletRain
      ? Math.max(44, Math.min(88, Math.round(width / 16)))
      : width >= 1025 ? 108 : Math.max(32, Math.round(108 * width / 1280));
    if (rainColumnCount === currentColumnCount) return;
    currentColumnCount = rainColumnCount;
    heroAmbient.replaceChildren();
    heroAmbient.classList.toggle('is-tablet-rain', tabletRain);
    const musicGlyphs = ['♪', '♫', '♩', '♬', '♭', '♮', '♯', '𝄞'];
    for (let index = 0; index < rainColumnCount; index++) {
      const column = document.createElement('div');
      const height = 0.56 + ((Math.sin(index * 1.17 + 0.6) + 1) / 2) * 0.44;
      const density = 0.15 + ((Math.sin(index * 0.81 + 1.4) + 1) / 2) * 0.24;
      const duration = 15 + ((index * 7) % 17) * 0.65;
      const delay = -(((index * 13) % 49) / 3.2);
      const rainRowCount = tabletRain ? 18 : 22;
      let content = '';

      for (let row = 0; row < rainRowCount; row++) {
        const gate = (index * 11 + row * 7 + index * row) % 13;
        const glyphIndex = (index * 5 + row * 3 + (row * index) % 7) % musicGlyphs.length;
        const glyph = musicGlyphs[glyphIndex];
        const secondGlyph = musicGlyphs[(glyphIndex + index + row + 3) % musicGlyphs.length];
        content += row > 0 && gate < 1 ? '  ' : glyph + (gate % 4 === 0 ? ' ' : secondGlyph);
        content += row === rainRowCount - 1 ? '' : '\n';
      }

      column.className = 'hero-rain-column';
      function makeRainPlane(plane, speedScale, delayOffset) {
        const track = document.createElement('div');
        const sequence = document.createElement('div');
        const repeat = document.createElement('div');
        track.className = 'hero-rain-track hero-rain-plane--' + plane;
        sequence.className = 'hero-rain-run';
        repeat.className = 'hero-rain-run';
        sequence.textContent = content;
        repeat.textContent = content;
        track.style.setProperty('--rain-plane-speed', (duration * speedScale).toFixed(2) + 's');
        track.style.setProperty('--rain-plane-delay', (delay + delayOffset).toFixed(2) + 's');
        track.append(sequence, repeat);
        return track;
      }

      column.style.setProperty('--rain-height', height.toFixed(3));
      column.style.setProperty('--rain-opacity', density.toFixed(3));
      column.style.setProperty('--rain-left', (index / (rainColumnCount - 1) * 98).toFixed(3) + '%');
      column.style.setProperty('--rain-glimpse-duration', (23 + ((index * 11) % 19)).toFixed(1) + 's');
      column.style.setProperty('--rain-glimpse-delay', (-((index * 17.3) % 41)).toFixed(1) + 's');
      if (!tabletRain) column.appendChild(makeRainPlane('far', 1.28, -2.7));
      column.appendChild(makeRainPlane('main', 1, 0));
      if (!tabletRain && index % 4 === 1) column.appendChild(makeRainPlane('near', 0.78, -5.1));
      heroAmbient.appendChild(column);
    }
  }
  syncHeroRain();
  const resizeObserver = new ResizeObserver(syncHeroRain);
  resizeObserver.observe(heroAmbient);
  if (hero && 'IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        hero.classList.toggle('hero-effects-paused', !entry.isIntersecting);
      });
    });
    visibilityObserver.observe(hero);
  }
  window.SRUK.cleanupHeroRain = function () {
    resizeObserver.disconnect();
    visibilityObserver?.disconnect();
    hero?.classList.remove('hero-effects-paused');
    window.SRUK.cleanupHeroRain = null;
  };
};
window.SRUK_initHeroRain();

/* ── Live Player ──────────────────────────────────────
   Plays the live Shoutcast stream. Fetches now-playing
   metadata from /api/nowplaying on load and every 30s.
─────────────────────────────────────────────────────── */
(function initPlayer() {
  const btn        = document.getElementById('playerBtn');
  const label      = document.getElementById('playerBtnLabel');
  const audio      = document.getElementById('liveAudio');
  const slider     = document.getElementById('volumeSlider');

  if (!btn || !audio) return;

  const phoneLightQuery = window.matchMedia('(max-width: 767px) and (orientation: portrait)');
  const desktopVisualizerQuery = window.matchMedia('(min-width: 768px)');
  const computerVisualizerQuery = window.matchMedia('(min-width: 1025px)');
  const heroDisplay = document.getElementById('heroNowPlayingSlot');
  const visualizerBars = heroDisplay
    ? Array.from(heroDisplay.querySelectorAll('.hero-waveform span'))
    : [];
  let audioContext = null;
  let analyser = null;
  let mediaSource = null;
  let frequencyData = null;
  let animationFrame = 0;
  const analysisBandCount = visualizerBars.length;
  const smoothedLevels = Array.from({ length: analysisBandCount }, function () { return 0.12; });
  const peakLevels = Array.from({ length: analysisBandCount }, function () { return 0.12; });
  // Phone preset mode stays enabled until iOS Safari exposes the live SHOUTcast
  // samples to Web Audio. The diagnostic on 2026-10-30 showed a running context
  // and advancing playback time, but analyser max/average levels of 0/0.
  // The reactive analyser functions below are intentionally retained for later;
  // set this true to restore reactive analysis on phones. Other displays keep it.
  const USE_REACTIVE_PHONE_ANALYSER = false;
  const audioDebugEnabled = new URLSearchParams(window.location.search).get('audioDebug') === '1';
  let audioDebugPanel = null;
  let lastAudioDebugUpdate = 0;

  if (audioDebugEnabled) {
    audioDebugPanel = document.createElement('output');
    audioDebugPanel.setAttribute('aria-live', 'polite');
    audioDebugPanel.style.cssText = 'position:fixed;z-index:99999;top:8px;left:8px;right:8px;padding:8px 10px;background:rgba(0,0,0,.92);border:1px solid #c00;color:#fff;font:12px/1.45 monospace;white-space:pre-wrap;pointer-events:none';
    audioDebugPanel.textContent = (!phoneLightQuery.matches || USE_REACTIVE_PHONE_ANALYSER)
      ? 'Audio diagnostic: waiting for play'
      : 'Phone preset visualiser active\nReactive analyser preserved and disabled';
    document.body.appendChild(audioDebugPanel);
  }

  function updateAudioDebug(levels) {
    if (!audioDebugPanel) return;
    const now = performance.now();
    if (levels && now - lastAudioDebugUpdate < 500) return;
    lastAudioDebugUpdate = now;
    let peak = 0;
    let total = 0;
    if (levels) {
      levels.forEach(function (value) {
        peak = Math.max(peak, value);
        total += value;
      });
    }
    audioDebugPanel.textContent = [
      'AudioContext: ' + (audioContext ? audioContext.state : 'not created'),
      'Audio: ' + (audio.paused ? 'paused' : 'playing') + ' | readyState ' + audio.readyState + ' | time ' + audio.currentTime.toFixed(1) + 's',
      (!phoneLightQuery.matches || USE_REACTIVE_PHONE_ANALYSER)
        ? (levels ? 'Analyser max/avg: ' + peak + '/' + (total / Math.max(1, levels.length)).toFixed(1) + ' of 255' : 'Analyser: waiting for samples')
        : 'Analyser: disabled; phone preset is active'
    ].join('\n');
  }

  function initAudioAnalyser() {
    if (!analysisBandCount) return false;
    if (analyser) return true;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    try {
      audioContext = new AudioContextClass();
      const nextAnalyser = audioContext.createAnalyser();
      // Lower the noise floor for quieter phone playback and keep the analyser
      // responsive enough to follow the stream's real dynamics.
      nextAnalyser.fftSize = 2048;
      nextAnalyser.minDecibels = -90;
      nextAnalyser.maxDecibels = -12;
      nextAnalyser.smoothingTimeConstant = 0.32;
      const nextSource = audioContext.createMediaElementSource(audio);
      mediaSource = nextSource;
      nextSource.connect(nextAnalyser);
      nextAnalyser.connect(audioContext.destination);
      analyser = nextAnalyser;
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      audioContext.addEventListener('statechange', function () {
        updateAudioDebug();
        if (audioContext.state === 'running' && !audio.paused) {
          startAudioSpectrum();
        } else if (audioContext.state !== 'running' && animationFrame) {
          stopAudioSpectrum();
        }
      });
      return true;
    } catch (error) {
      // If analysis setup fails after the media source is created, keep audio audible.
      try {
        if (mediaSource && audioContext) {
          mediaSource.disconnect();
          mediaSource.connect(audioContext.destination);
        }
      } catch (disconnectError) {}
      if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(function () {});
      analyser = null;
      return false;
    }
  }

  function drawAudioSpectrum() {
    if (!analyser || audio.paused || audio.ended) {
      animationFrame = 0;
      return;
    }

    analyser.getByteFrequencyData(frequencyData);
    updateAudioDebug(frequencyData);
    const binCount = frequencyData.length;
    const barCount = smoothedLevels.length;
    const peakDecay = desktopVisualizerQuery.matches ? 0.0065 : 0.018;
    const capPush = desktopVisualizerQuery.matches ? 0.12 : 0;
    const useSoftCompression = computerVisualizerQuery.matches;

    smoothedLevels.forEach(function (_, index) {
      const bar = visualizerBars[index];
      // Map low frequencies near the centre and higher frequencies outward,
      // so bass energy is not concentrated on the left side of the display.
      const minBin = 2;
      const maxBin = Math.max(minBin + 1, Math.floor(binCount * 0.86));
      const leftEdgeRadius = Math.abs((index / barCount) * 2 - 1);
      const rightEdgeRadius = Math.abs(((index + 1) / barCount) * 2 - 1);
      const bandStart = Math.min(leftEdgeRadius, rightEdgeRadius);
      const bandEnd = Math.max(leftEdgeRadius, rightEdgeRadius);
      const start = Math.floor(minBin * Math.pow(maxBin / minBin, bandStart));
      const end = Math.max(start + 1, Math.ceil(minBin * Math.pow(maxBin / minBin, bandEnd)));
      let peak = 0;
      let sum = 0;
      let count = 0;
      for (let bin = start; bin < Math.min(end, binCount); bin++) {
        const magnitude = frequencyData[bin] / 255;
        peak = Math.max(peak, magnitude);
        sum += magnitude;
        count++;
      }

      const average = count ? sum / count : 0;
      // On computer-sized displays, avoid clipping one loud frequency bin to
      // full scale. Weight the band mean more heavily, then use a soft curve
      // so quieter playback still produces visible movement.
      const bandEnergy = useSoftCompression
        ? peak * 0.48 + average * 0.52
        : Math.min(1, peak * 0.72 + average * 0.72);
      // A subtle per-bar gain keeps corresponding positions from becoming
      // identical while preserving the centre-out frequency layout.
      const barGain = 0.92 + ((Math.sin(index * 1.618 + 0.83) + 1) / 2) * 0.16;
      const target = useSoftCompression
        ? (0.08 + Math.pow(bandEnergy, 0.72) * 0.72) * barGain
        : (0.1 + Math.pow(bandEnergy, 0.82) * 0.82) * barGain;
      const response = target > smoothedLevels[index] ? 0.62 : 0.24;
      smoothedLevels[index] += (target - smoothedLevels[index]) * response;
      if (smoothedLevels[index] > peakLevels[index]) {
        peakLevels[index] = Math.min(0.98, smoothedLevels[index] + capPush);
      } else {
        peakLevels[index] = Math.max(smoothedLevels[index], peakLevels[index] - peakDecay);
      }
      if (bar) {
        bar.style.setProperty('--wave-level', smoothedLevels[index].toFixed(3));
        const capTop = ((1 - peakLevels[index]) * 50).toFixed(1);
        bar.style.setProperty('--wave-cap-top', capTop + '%');
        bar.style.setProperty('--wave-cap-bottom', (100 - Number(capTop)).toFixed(1) + '%');
      }
    });

    animationFrame = window.requestAnimationFrame(drawAudioSpectrum);
  }

  function startAudioSpectrum() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!analyser || audioContext.state !== 'running') return;
    if (heroDisplay) heroDisplay.classList.add('is-analysis-active');
    if (!animationFrame) animationFrame = window.requestAnimationFrame(drawAudioSpectrum);
  }

  function stopAudioSpectrum() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (heroDisplay) heroDisplay.classList.remove('is-analysis-active');
    visualizerBars.forEach(function (bar) {
      bar.style.removeProperty('--wave-level');
      bar.style.removeProperty('--wave-cap-top');
      bar.style.removeProperty('--wave-cap-bottom');
    });
    for (let index = 0; index < smoothedLevels.length; index++) {
      smoothedLevels[index] = 0.12;
      peakLevels[index] = 0.12;
    }
  }

  function setPlayIcon() {
    const svg = btn.querySelector('svg');
    if (!svg) return;
    svg.innerHTML = '<polygon points="5,3 19,12 5,21" fill="currentColor"/>';
  }

  function setPauseIcon() {
    const svg = btn.querySelector('svg');
    if (!svg) return;
    svg.innerHTML = '<rect x="5" y="3" width="4" height="18" fill="currentColor"/><rect x="15" y="3" width="4" height="18" fill="currentColor"/>';
  }

  const trackEl = document.getElementById('playerTrackA');
  const showEl = document.getElementById('playerShowA');
  const trackWrap = trackEl ? trackEl.closest('.player-track-wrap') : null;
  let displayedTrack = trackEl ? (trackEl.getAttribute('aria-label') || trackEl.textContent.trim()) : '';

  function renderTrackTicker(text) {
    if (!trackEl || !trackWrap) return;

    const firstCopy = document.createElement('span');
    const duplicateCopy = document.createElement('span');
    firstCopy.className = 'player-track-copy';
    duplicateCopy.className = 'player-track-copy player-track-copy--duplicate';
    duplicateCopy.setAttribute('aria-hidden', 'true');
    firstCopy.textContent = text;
    duplicateCopy.textContent = text;
    trackEl.classList.remove('is-overflowing');
    trackEl.style.removeProperty('--player-track-offset');
    trackEl.style.removeProperty('--player-track-duration');
    trackEl.replaceChildren(firstCopy, duplicateCopy);
    trackEl.setAttribute('aria-label', text);

    const copyWidth = firstCopy.getBoundingClientRect().width;
    if (copyWidth <= trackWrap.clientWidth + 1) return;

    const gap = parseFloat(window.getComputedStyle(trackEl).columnGap) || 32;
    const distance = copyWidth + gap;
    trackEl.style.setProperty('--player-track-offset', (-distance).toFixed(1) + 'px');
    trackEl.style.setProperty('--player-track-duration', Math.max(8, distance / 34).toFixed(1) + 's');
    trackEl.classList.add('is-overflowing');
  }

  if (trackEl && displayedTrack) renderTrackTicker(displayedTrack);

  if (trackWrap && 'ResizeObserver' in window) {
    const trackResizeObserver = new ResizeObserver(function () { renderTrackTicker(displayedTrack); });
    trackResizeObserver.observe(trackWrap);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { renderTrackTicker(displayedTrack); });
  } else if (trackWrap) {
    window.addEventListener('resize', function () { renderTrackTicker(displayedTrack); });
  }

  function setTrackText(text) {
    if (!trackEl) return;
    const nextText = text || 'Signature Radio UK';
    if (nextText === displayedTrack) return;

    displayedTrack = nextText;
    trackEl.title = nextText;
    renderTrackTicker(nextText);
  }

  function updatePlayerDisplay(data) {
    if (!trackEl) return;

    const track     = data.track || (data.track === null ? 'Live stream' : data.title) || 'Signature Radio UK';
    const show      = data.show      || null;
    const presenter = data.presenter || null;
    const showLine = show
      ? (presenter && presenter !== show ? presenter + ' \u2014 ' + show : show)
      : '';

    setTrackText(track);
    if (showEl) {
      showEl.textContent = showLine;
      showEl.hidden = !showLine;
    }
  }

  // Fetch now-playing metadata and update the player track display
  function fetchNowPlaying() {
    fetch('/api/nowplaying')
      .then(function (res) {
        if (!res.ok) throw new Error('nowplaying fetch failed');
        return res.json();
      })
      .then(updatePlayerDisplay)
      .catch(function () {
        // Keep existing display on failure
      });
  }

  // Poll on load and every 30 seconds; track titles stay visible while show info has its own line.
  fetchNowPlaying();
  setInterval(fetchNowPlaying, 30000);

  let playing = !audio.paused;
  const heroArtistName = document.getElementById('heroArtistName');
  const featuredArtists = [
    'Sanchez',
    'Angie Stone',
    'Stevie Wonder',
    'Michael Jackson',
    'Shaun Escoffery',
    'Whitney Houston',
    'Jocelyn Brown',
    'Cornell CC Carter',
    'A Tribe Called Quest'
  ];
  let featuredArtistIndex = 0;

  function setPhoneWavePreset() {
    if (!phoneLightQuery.matches || !visualizerBars.length) return;
    visualizerBars.forEach(function (bar, index) {
      const broad = (Math.sin(index * 0.173 + 0.41) + 1) / 2;
      const cluster = (Math.sin(index * 0.437 + 1.83) + 1) / 2;
      const grain = (Math.sin(index * 1.117 + 0.92) + 1) / 2;
      const transient = Math.pow(Math.max(0, Math.sin(index * 0.293 + 0.67)), 9) * 0.18;
      const floor = 0.12 + grain * 0.16;
      const peak = Math.min(0.96, 0.22 + broad * 0.28 + cluster * 0.24 + grain * 0.18 + transient);
      const middle = floor + (peak - floor) * (0.56 + grain * 0.22);
      const speed = 1.18 + ((Math.sin(index * 0.337 + 2.1) + 1) / 2) * 1.12;
      const delay = -((Math.sin(index * 0.719 + 0.5) + 1) * 1.6);
      bar.style.setProperty('--wave-preset-floor', floor.toFixed(3));
      bar.style.setProperty('--wave-preset-middle', middle.toFixed(3));
      bar.style.setProperty('--wave-preset-peak', peak.toFixed(3));
      bar.style.setProperty('--wave-preset-speed', speed.toFixed(2) + 's');
      bar.style.setProperty('--wave-preset-delay', delay.toFixed(2) + 's');
    });
  }

  setPhoneWavePreset();
  if (phoneLightQuery.addEventListener) phoneLightQuery.addEventListener('change', setPhoneWavePreset);
  else phoneLightQuery.addListener(setPhoneWavePreset);

  function rotateFeaturedArtist() {
    if (!heroArtistName || playing || document.visibilityState === 'hidden') return;
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      featuredArtistIndex = (featuredArtistIndex + 1) % featuredArtists.length;
      heroArtistName.textContent = featuredArtists[featuredArtistIndex];
      return;
    }

    heroArtistName.classList.add('is-changing');
    window.setTimeout(function () {
      if (playing) {
        heroArtistName.classList.remove('is-changing');
        return;
      }
      featuredArtistIndex = (featuredArtistIndex + 1) % featuredArtists.length;
      heroArtistName.textContent = featuredArtists[featuredArtistIndex];
      window.requestAnimationFrame(function () {
        heroArtistName.classList.remove('is-changing');
      });
    }, 420);
  }

  if (heroArtistName) window.setInterval(rotateFeaturedArtist, 3600);

  let preferredVolume = audio.volume;
  let volumeFadeFrame = 0;
  let volumeFadeToken = 0;

  function cancelVolumeFade() {
    volumeFadeToken++;
    if (volumeFadeFrame) window.cancelAnimationFrame(volumeFadeFrame);
    volumeFadeFrame = 0;
  }

  function fadeAudioTo(targetVolume, duration, onComplete) {
    cancelVolumeFade();
    const token = volumeFadeToken;
    const startVolume = audio.volume;
    const startedAt = performance.now();
    const target = Math.max(0, Math.min(1, targetVolume));

    function step(now) {
      if (token !== volumeFadeToken) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = progress * progress * (3 - 2 * progress);
      audio.volume = startVolume + (target - startVolume) * easedProgress;

      if (progress < 1) {
        volumeFadeFrame = window.requestAnimationFrame(step);
      } else {
        volumeFadeFrame = 0;
        if (onComplete) onComplete();
      }
    }

    volumeFadeFrame = window.requestAnimationFrame(step);
  }

  let artistReturnTimer = 0;
  function clearArtistReturn() {
    if (artistReturnTimer) window.clearTimeout(artistReturnTimer);
    artistReturnTimer = 0;
    if (heroDisplay) heroDisplay.classList.remove('is-returning');
  }

  function returnArtistPanel() {
    if (!heroDisplay) return;
    if (artistReturnTimer) window.clearTimeout(artistReturnTimer);
    artistReturnTimer = 0;
    if (!phoneLightQuery.matches) {
      heroDisplay.classList.remove('is-playing', 'is-returning');
      return;
    }
    // Change states together so CSS never paints the panel at its resting point
    // between the exit and entrance animations.
    heroDisplay.classList.remove('is-playing');
    heroDisplay.classList.add('is-returning');
    artistReturnTimer = window.setTimeout(clearArtistReturn, 1050);
  }

  btn.addEventListener('click', function () {
    if (!playing) {
      const wasPaused = audio.paused;
      preferredVolume = slider ? parseFloat(slider.value) : preferredVolume;
      if (wasPaused) audio.volume = 0;
      const canAnalyze = (!phoneLightQuery.matches || USE_REACTIVE_PHONE_ANALYSER) && initAudioAnalyser();
      const contextReady = canAnalyze
        ? (audioContext.state === 'running'
          ? Promise.resolve(true)
          : audioContext.resume().then(function () { return true; }).catch(function () { return false; }))
        : Promise.resolve(false);
      updateAudioDebug();
      Promise.all([audio.play(), contextReady]).then(function (results) {
        playing = true;
        fadeAudioTo(preferredVolume, 420);
        if (heroDisplay) {
          clearArtistReturn();
          heroDisplay.classList.add('is-playing');
        }
        if (canAnalyze && results[1]) startAudioSpectrum();
        updateAudioDebug();
        label.textContent = 'PAUSE';
        btn.setAttribute('aria-label', 'Pause live stream');
        setPauseIcon();
      }).catch(function () {
        cancelVolumeFade();
        audio.volume = preferredVolume;
        stopAudioSpectrum();
        label.textContent = 'ERROR';
        updateAudioDebug();
      });
    } else {
      playing = false;
      stopAudioSpectrum();
      if (heroDisplay) returnArtistPanel();
      label.textContent = 'LISTEN';
      btn.setAttribute('aria-label', 'Play live stream');
      setPlayIcon();
      fadeAudioTo(0, 360, function () {
        audio.pause();
        audio.volume = preferredVolume;
      });
    }
  });

  // If the stream stalls or errors, reset the button state
  audio.addEventListener('error', function () {
    cancelVolumeFade();
    audio.volume = preferredVolume;
    playing = false;
    stopAudioSpectrum();
    if (heroDisplay) returnArtistPanel();
    label.textContent = 'LISTEN';
    setPlayIcon();
  });

  // Volume slider
  if (slider) {
    // Restore last saved volume
    const saved = parseFloat(localStorage.getItem('sruk_volume'));
    if (!isNaN(saved)) {
      preferredVolume = saved;
      audio.volume = saved;
      slider.value = saved;
    }

    slider.addEventListener('input', function () {
      preferredVolume = parseFloat(slider.value);
      audio.volume = preferredVolume;
      localStorage.setItem('sruk_volume', slider.value);
    });
  }
})();
