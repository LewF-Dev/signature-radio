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
   Custom play/pause overlay. #t=0.1 in the src causes
   browsers to load the first frame as a natural poster.
─────────────────────────────────────────────────────── */
(function initVideo() {
  const container = document.getElementById('videoContainer');
  const video     = document.getElementById('stationVideo');
  const btn       = document.getElementById('videoPlayBtn');

  if (!container || !video) return;

  let videoLoadStarted = false;
  function prepareVideo() {
    if (videoLoadStarted) return;
    videoLoadStarted = true;
    video.preload = 'metadata';
    video.load();
  }

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(function (entries) {
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
    video.play();
    container.classList.add('playing');
  }

  function pause() {
    video.pause();
    container.classList.remove('playing');
  }

  container.addEventListener('click', function () {
    if (video.paused) { play(); } else { pause(); }
  });

  // Show overlay again when video ends
  video.addEventListener('ended', function () {
    container.classList.remove('playing');
  });
})();

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

/* ── Hero About Link ───────────────────────────────── */
(function initHeroAboutLink() {
  document.addEventListener('click', function (event) {
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
  const desktopRainQuery = window.matchMedia('(min-width: 1025px)');
  const desktopVisualizerQuery = window.matchMedia('(min-width: 768px)');
  const computerVisualizerQuery = window.matchMedia('(min-width: 1025px)');
  const heroDisplay = document.getElementById('heroNowPlayingSlot');
  const visualizerBars = heroDisplay
    ? Array.from(heroDisplay.querySelectorAll('.hero-waveform span'))
    : [];
  const heroAmbient = document.getElementById('heroAmbientVisualizer');
  const ambientBars = [];
  const heroRainColumns = [];
  if (heroAmbient) {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    function createHeroRain() {
      const isPhoneRain = phoneLightQuery.matches;
      const isDesktopRain = desktopRainQuery.matches;
      if ((!isPhoneRain && !isDesktopRain) || heroRainColumns.length) return;
      const rainColumnCount = isDesktopRain ? 50 : 32;
      const musicGlyphs = ['♪', '♫', '♩', '♬', '♭', '♮', '♯', '𝄞'];
      for (let index = 0; index < rainColumnCount; index++) {
      const column = document.createElement('div');
      const height = 0.56 + ((Math.sin(index * 1.17 + 0.6) + 1) / 2) * 0.44;
      const density = 0.15 + ((Math.sin(index * 0.81 + 1.4) + 1) / 2) * 0.24;
      const fadeStart = 0.74 + ((Math.sin(index * 1.31 + 0.7) + 1) / 2) * 0.22;
      const duration = 7.5 + ((index * 7) % 17) * 0.42;
      const liveDuration = duration * (0.66 + ((index * 3) % 5) * 0.035);
      const delay = -(((index * 13) % 49) / 3.2);
      let content = '';

      for (let row = 0; row < 22; row++) {
        const gate = (index * 11 + row * 7 + index * row) % 13;
        const glyphIndex = (index * 5 + row * 3 + (row * index) % 7) % musicGlyphs.length;
        const glyph = musicGlyphs[glyphIndex];
        const secondGlyph = musicGlyphs[(glyphIndex + index + row + 3) % musicGlyphs.length];
        content += row > 0 && gate < 1 ? '  ' : glyph + (gate % 4 === 0 ? ' ' : secondGlyph);
        content += row === 21 ? '' : '\n';
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
        track.style.setProperty('--rain-plane-live-speed', (liveDuration * speedScale).toFixed(2) + 's');
        track.style.setProperty('--rain-plane-delay', (delay + delayOffset).toFixed(2) + 's');
        track.append(sequence, repeat);
        return track;
      }

      column.style.setProperty('--rain-height', height.toFixed(3));
      column.style.setProperty('--rain-opacity', density.toFixed(3));
      column.style.setProperty('--rain-fade-start', (fadeStart * 100).toFixed(1) + '%');
      column.appendChild(makeRainPlane('far', 1.28, -2.7));
      column.appendChild(makeRainPlane('main', 1, 0));
      if (index % 4 === 1) column.appendChild(makeRainPlane('near', 0.78, -5.1));
      heroAmbient.appendChild(column);
      heroRainColumns.push(column);
      // Keep analyser-driven column updates on phones only. Desktop rain is
      // ambient texture, so it adds no per-frame DOM work to the visualiser.
      if (isPhoneRain) ambientBars.push(column);
      }
    }

    function syncHeroRainMode() {
      heroRainColumns.forEach(function (column) { column.remove(); });
      heroRainColumns.length = 0;
      ambientBars.length = 0;
      createHeroRain();
    }

    createHeroRain();
    if (desktopRainQuery.addEventListener) desktopRainQuery.addEventListener('change', syncHeroRainMode);
    else desktopRainQuery.addListener(syncHeroRainMode);

    let lightMoveTimer = 0;
    let rainFadeTimer = 0;
    let previousLightX = 0;
    let previousLightY = 0;

    function startRainFadeShifts() {
      if (rainFadeTimer || !ambientBars.length || reducedMotionQuery.matches) return;
      rainFadeTimer = window.setInterval(function () {
        if (!phoneLightQuery.matches || document.visibilityState === 'hidden') return;

        const columnsToShift = Math.max(5, Math.ceil(ambientBars.length * 0.14));
        const shuffledColumns = ambientBars.slice();
        for (let index = shuffledColumns.length - 1; index > 0; index--) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          [shuffledColumns[index], shuffledColumns[swapIndex]] = [shuffledColumns[swapIndex], shuffledColumns[index]];
        }

        shuffledColumns.slice(0, columnsToShift).forEach(function (column) {
          const nextFadeStart = 0.68 + Math.random() * 0.3;
          column.style.setProperty('--rain-fade-start', (nextFadeStart * 100).toFixed(1) + '%');
        });
      }, 1800);
    }

    function stopRainFadeShifts() {
      if (!rainFadeTimer) return;
      window.clearInterval(rainFadeTimer);
      rainFadeTimer = 0;
    }

    function movePhoneLight() {
      lightMoveTimer = 0;
      if (!phoneLightQuery.matches || reducedMotionQuery.matches || document.visibilityState === 'hidden') {
        heroAmbient.style.setProperty('--hero-light-opacity', '0');
        return;
      }

      const x = -20 + Math.random() * 190;
      const y = -80 + Math.random() * 115;
      const lightWidth = heroAmbient.clientWidth * 0.19;
      const lightHeight = heroAmbient.clientHeight * 0.28;
      const travelDistance = Math.hypot(
        (x - previousLightX) * lightWidth / 100,
        (y - previousLightY) * lightHeight / 100
      );
      const duration = Math.max(1.8, travelDistance / 22);
      const opacity = Math.random() < 0.2 ? 0 : 0.38 + Math.random() * 0.52;
      const pause = 250 + Math.random() * 850;
      previousLightX = x;
      previousLightY = y;
      heroAmbient.style.setProperty('--hero-light-duration', duration.toFixed(2) + 's');
      heroAmbient.style.setProperty('--hero-light-x', x.toFixed(1) + '%');
      heroAmbient.style.setProperty('--hero-light-y', y.toFixed(1) + '%');
      heroAmbient.style.setProperty('--hero-light-opacity', opacity.toFixed(2));
      lightMoveTimer = window.setTimeout(movePhoneLight, duration * 1000 + pause);
    }

    function syncPhoneLight() {
      window.clearTimeout(lightMoveTimer);
      lightMoveTimer = 0;
      if (!phoneLightQuery.matches || reducedMotionQuery.matches || document.visibilityState === 'hidden') {
        stopRainFadeShifts();
        heroAmbient.style.setProperty('--hero-light-opacity', '0');
        return;
      }
      createHeroRain();
      startRainFadeShifts();
      lightMoveTimer = window.setTimeout(movePhoneLight, 180 + Math.random() * 240);
    }

    if (phoneLightQuery.addEventListener) phoneLightQuery.addEventListener('change', syncPhoneLight);
    else phoneLightQuery.addListener(syncPhoneLight);
    if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener('change', syncPhoneLight);
    else reducedMotionQuery.addListener(syncPhoneLight);
    document.addEventListener('visibilitychange', syncPhoneLight);
    syncPhoneLight();
  }
  let audioContext = null;
  let analyser = null;
  let mediaSource = null;
  let frequencyData = null;
  let animationFrame = 0;
  const analysisBandCount = Math.max(visualizerBars.length, ambientBars.length);
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

    ambientBars.forEach(function (bar, index) {
      const position = (index / Math.max(1, ambientBars.length - 1)) * (smoothedLevels.length - 1);
      const lowerIndex = Math.floor(position);
      const upperIndex = Math.min(smoothedLevels.length - 1, lowerIndex + 1);
      const blend = position - lowerIndex;
      const level = smoothedLevels[lowerIndex] * (1 - blend) + smoothedLevels[upperIndex] * blend;
      bar.style.setProperty('--rain-height', (0.48 + level * 0.78).toFixed(3));
      bar.style.setProperty('--rain-opacity', (0.07 + level * 0.38).toFixed(3));
    });

    animationFrame = window.requestAnimationFrame(drawAudioSpectrum);
  }

  function startAudioSpectrum() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!analyser || audioContext.state !== 'running') return;
    if (heroDisplay) heroDisplay.classList.add('is-analysis-active');
    if (heroAmbient) heroAmbient.classList.add('is-analysis-active');
    if (!animationFrame) animationFrame = window.requestAnimationFrame(drawAudioSpectrum);
  }

  function stopAudioSpectrum() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (heroDisplay) heroDisplay.classList.remove('is-analysis-active');
    if (heroAmbient) {
      heroAmbient.classList.remove('is-analysis-active');
      ambientBars.forEach(function (bar) {
        bar.style.removeProperty('--rain-height');
        bar.style.removeProperty('--rain-opacity');
      });
    }
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
        if (heroAmbient) heroAmbient.classList.add('is-playing');
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
      if (heroAmbient) heroAmbient.classList.remove('is-playing');
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
    if (heroAmbient) heroAmbient.classList.remove('is-playing');
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
