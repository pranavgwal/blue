// ASCII Magic — Interactive Cyberpunk Engine
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const posterViewport = document.getElementById('poster-viewport');
  const posterCard = document.getElementById('poster-card');
  const posterImg = document.getElementById('poster-image');
  const asciiCanvas = document.getElementById('ascii-canvas');
  const btnAudio = document.getElementById('btn-audio');
  const btnCrt = document.getElementById('btn-crt');
  const btnMatrix = document.getElementById('btn-matrix');
  const btnGlitch = document.getElementById('btn-glitch');
  const terminalInput = document.getElementById('terminal-input');
  const terminalSubmitBtn = document.getElementById('terminal-submit-btn');
  const terminalOutput = document.getElementById('terminal-output');
  const starBeacon = document.getElementById('star-beacon');
  const palettePills = document.querySelectorAll('.palette-pill');

  // --- 1. 3D Tilt Parallax on Poster Card ---
  let isHoveringPoster = false;

  posterViewport.addEventListener('mousemove', (e) => {
    isHoveringPoster = true;
    const rect = posterCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate normalized rotation (-12deg to +12deg)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    posterCard.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`;
  });

  posterViewport.addEventListener('mouseleave', () => {
    isHoveringPoster = false;
    posterCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });

  // --- 2. Live ASCII Rain & Matrix Stream Canvas ---
  const ctx = asciiCanvas.getContext('2d');
  const asciiChars = "01xX$#MW&8%B@.'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*".split('');
  
  let animationFrameId;
  let columns = 0;
  let drops = [];
  const fontSize = 11;

  function resizeCanvas() {
    asciiCanvas.width = posterCard.clientWidth || 540;
    asciiCanvas.height = posterCard.clientHeight || 810;
    columns = Math.floor(asciiCanvas.width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      // Stagger initial Y positions for natural flow
      drops[i] = Math.floor(Math.random() * -50);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function drawAsciiRain() {
    // Semi-transparent fade to create cascading phosphor trails
    ctx.fillStyle = 'rgba(5, 10, 30, 0.12)';
    ctx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);

    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = asciiChars[Math.floor(Math.random() * asciiChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Color variation: Lead character is bright white/cyan, tail is phosphor green
      if (Math.random() > 0.88) {
        ctx.fillStyle = '#ffffff'; // Leading star spark
      } else if (Math.random() > 0.5) {
        ctx.fillStyle = '#00f7ff'; // Cyan matrix
      } else {
        ctx.fillStyle = '#33ff66'; // Retro phosphor green
      }

      ctx.fillText(char, x, y);

      // Reset drop to top with slight randomization
      if (y > asciiCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    animationFrameId = requestAnimationFrame(drawAsciiRain);
  }

  // Start ASCII stream
  drawAsciiRain();

  // --- 3. Web Audio API: 1980s Retro Cyberpunk Synth Engine ---
  let audioCtx = null;
  let isAudioPlaying = false;
  let masterGain = null;
  let droneOsc1 = null;
  let droneOsc2 = null;
  let subOsc = null;
  let filterNode = null;
  let noiseNode = null;

  function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Warm Lowpass Filter
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(280, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(4, audioCtx.currentTime);
    filterNode.connect(masterGain);

    // Drone Oscillator 1 (Sawtooth - Deep D1 @ 36.7Hz)
    droneOsc1 = audioCtx.createOscillator();
    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(36.71, audioCtx.currentTime);

    // Drone Oscillator 2 (Slightly detuned + 7 semitones fifth @ A1)
    droneOsc2 = audioCtx.createOscillator();
    droneOsc2.type = 'sawtooth';
    droneOsc2.frequency.setValueAtTime(55.0, audioCtx.currentTime);
    droneOsc2.detune.setValueAtTime(8, audioCtx.currentTime);

    // Sub Bass Sine (Sub-octave)
    subOsc = audioCtx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(36.71, audioCtx.currentTime);

    // Connect oscillators to filter
    droneOsc1.connect(filterNode);
    droneOsc2.connect(filterNode);
    subOsc.connect(filterNode);

    // Subtle Analog Tape Hiss Buffer
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.015;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, audioCtx.currentTime);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(masterGain);

    // Start Oscillators
    droneOsc1.start();
    droneOsc2.start();
    subOsc.start();
    noiseNode.start();

    // Slow ambient filter sweep LFO
    setInterval(() => {
      if (isAudioPlaying && audioCtx && audioCtx.state === 'running') {
        const targetFreq = 220 + Math.random() * 260;
        filterNode.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 3.5);
      }
    }, 4000);
  }

  function toggleAudio() {
    if (!audioCtx) {
      initAudio();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      isAudioPlaying = true;
      masterGain.gain.setTargetAtTime(0.35, audioCtx.currentTime, 1.2);
      btnAudio.classList.add('active');
      btnAudio.innerHTML = '<span class="btn-icon">🔊</span> <span class="btn-label">AUDIO: ON</span>';
      printTerminal(">> CYBERPUNK SYNTH DRONE ACTIVATED. ANALOG TAPE WARMTH ON.");
    } else {
      isAudioPlaying = false;
      masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.8);
      btnAudio.classList.remove('active');
      btnAudio.innerHTML = '<span class="btn-icon">🔈</span> <span class="btn-label">AUDIO: OFF</span>';
      printTerminal(">> AUDIO SYSTEM MUTED.");
    }
  }

  // Terminal Blip Sound FX
  function playTerminalBlip(freq = 880, duration = 0.04) {
    if (!audioCtx || !isAudioPlaying) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  btnAudio.addEventListener('click', toggleAudio);

  // --- 4. Interactive Toggles (CRT, Matrix, Glitch) ---
  btnCrt.addEventListener('click', () => {
    document.body.classList.toggle('crt-active');
    document.body.classList.toggle('scanlines-active');
    const isActive = document.body.classList.contains('crt-active');
    btnCrt.classList.toggle('active', isActive);
    btnCrt.innerHTML = `<span class="btn-icon">📺</span> <span class="btn-label">CRT: ${isActive ? 'ON' : 'OFF'}</span>`;
    playTerminalBlip(620);
    printTerminal(`>> CRT SCANLINES & BLOOM ${isActive ? 'ENABLED' : 'DISABLED'}.`);
  });

  btnMatrix.addEventListener('click', () => {
    asciiCanvas.classList.toggle('hidden');
    const isActive = !asciiCanvas.classList.contains('hidden');
    btnMatrix.classList.toggle('active', isActive);
    btnMatrix.innerHTML = `<span class="btn-icon">⚡</span> <span class="btn-label">ASCII: ${isActive ? 'ON' : 'OFF'}</span>`;
    playTerminalBlip(740);
    printTerminal(`>> LIVING ASCII VOLUMETRIC STREAM ${isActive ? 'ACTIVATED' : 'CONCEALED'}.`);
  });

  btnGlitch.addEventListener('click', triggerGlitch);

  function triggerGlitch() {
    playTerminalBlip(240, 0.15);
    posterCard.classList.add('glitch-flash');
    setTimeout(() => {
      posterCard.classList.remove('glitch-flash');
    }, 450);
    printTerminal(">> CHROMATIC ABERRATION SPIKE DETECTED [SCANLINE CORRUPTION].");
  }

  // --- 5. Star Beacon Interactivity ---
  starBeacon.addEventListener('click', () => {
    playTerminalBlip(1200, 0.25);
    printTerminal(">> THE BEACON BURNS BRIGHT. 'WALK TOWARD THE STAR.'");
    starBeacon.style.transform = 'translate(-50%, -50%) scale(2.2)';
    setTimeout(() => {
      starBeacon.style.transform = '';
    }, 600);
  });

  // --- 6. Color Grade Presets ---
  palettePills.forEach(pill => {
    pill.addEventListener('click', () => {
      palettePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterType = pill.getAttribute('data-filter');
      posterImg.className = 'poster-img';

      if (filterType !== 'default') {
        posterImg.classList.add(`filter-${filterType}`);
      }

      playTerminalBlip(520);
      printTerminal(`>> COLOR PROFILE SWITCHED: [${filterType.toUpperCase()}]`);
    });
  });

  // --- 7. Terminal Console Engine ---
  function printTerminal(text, type = 'sys-reply') {
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function handleCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    printTerminal(`root@beacon:~$ ${cmdRaw}`, 'user-cmd');
    playTerminalBlip(980);

    switch (cmd) {
      case 'help':
        printTerminal(">> AVAILABLE DIRECTIVES:");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>quote</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Print the terminal manifesto");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>star</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Target coordinates of the four-pointed beacon");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>matrix</span>&nbsp;&nbsp;&nbsp;&nbsp;- Toggle ASCII live overlay streams");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>audio</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Toggle 80s analog synth drone soundscape");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>crt</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Toggle phosphor scanline CRT distortion");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>glitch</span>&nbsp;&nbsp;&nbsp;&nbsp;- Force chromatic RGB aberration pulse");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>download</span>&nbsp;&nbsp;- Save the high-definition poster image");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>about</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Concept, aesthetic specifications & lore");
        printTerminal("&nbsp;&nbsp;<span class='code-tag'>clear</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Clear the terminal monitor buffer");
        break;

      case 'quote':
      case 'manifesto':
      case 'reclaim':
        printTerminal("> RECLAIM YOUR DATA.", 'quote-line highlight');
        printTerminal("> THE CITY IS A SURVEILLANCE MACHINE.", 'quote-line highlight');
        printTerminal("> OPT OUT. DECENTRALIZE. WALK TOWARD THE STAR.", 'quote-line highlight');
        break;

      case 'batman':
      case 'manan':
      case 'dark knight':
        printTerminal(">> [AUTHENTICATED] ACCESS LEVEL: BATCAVE OVERRIDE.", 'quote-line highlight');
        printTerminal(">> AGENT: MANAN // THE BATMAN");
        printTerminal(">> \"IT'S NOT WHO I AM UNDERNEATH, BUT WHAT I DO THAT DEFINES ME.\"");
        triggerGlitch();
        break;

      case 'star':
      case 'beacon':
        printTerminal(">> TARGET LOCKED: BEACON STAR ALPHA-01.");
        printTerminal(">> 'Directly above him, a single brilliant white four-pointed star burns like a digital beacon.'");
        starBeacon.click();
        break;

      case 'matrix':
      case 'ascii':
        btnMatrix.click();
        break;

      case 'audio':
      case 'sound':
        btnAudio.click();
        break;

      case 'crt':
      case 'scanlines':
        btnCrt.click();
        break;

      case 'glitch':
        triggerGlitch();
        break;

      case 'download':
        document.getElementById('btn-download').click();
        printTerminal(">> DOWNLOADING: ascii_magic_poster.jpg (High-Definition Asset)");
        break;

      case 'about':
        printTerminal(">> ARTWORK ARCHITECTURE:");
        printTerminal("&nbsp;&bull; Medium: Retro-Futuristic Cyberpunk Terminal Poster");
        printTerminal("&nbsp;&bull; View: Extreme low-angle perspective converging upward");
        printTerminal("&nbsp;&bull; Aesthetics: 1980s-90s Japanese Cyberpunk & Risograph Halftone");
        printTerminal("&nbsp;&bull; Character: Lone silhouette in dark suit with briefcase");
        printTerminal("&nbsp;&bull; Typography: Elegant serif 'ASCII Magic' + Sharp Monospace");
        printTerminal("&nbsp;&bull; Symbol: Dual-circle surveillance eye decoded");
        break;

      case 'clear':
      case 'cls':
        terminalOutput.innerHTML = '';
        printTerminal(">> BUFFER CLEARED.");
        break;

      default:
        printTerminal(`>> UNRECOGNIZED DIRECTIVE: '${cmdRaw}'. Type <span class='code-tag'>help</span> for valid commands.`);
        break;
    }
  }

  terminalSubmitBtn.addEventListener('click', () => {
    const val = terminalInput.value;
    if (val) {
      handleCommand(val);
      terminalInput.value = '';
    }
  });

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      if (val) {
        handleCommand(val);
        terminalInput.value = '';
      }
    }
  });
});
