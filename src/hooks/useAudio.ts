import { useRef, useEffect } from 'react';

type SoundType = 'click' | 'rollover' | 'switch';

interface AudioElements {
  click: HTMLAudioElement[];
  rollover: HTMLAudioElement[];
  switch: HTMLAudioElement[];
}

interface WebAudioBuffers {
  click: AudioBuffer | null;
  rollover: AudioBuffer | null;
  switch: AudioBuffer | null;
}

export function useAudio() {
  const audioRef = useRef<AudioElements | null>(null);
  const webAudioRef = useRef<{
    context: AudioContext | null;
    buffers: WebAudioBuffers;
  }>({ context: null, buffers: { click: null, rollover: null, switch: null } });
  const indexRef = useRef<{ [key in SoundType]: number }>({
    click: 0,
    rollover: 0,
    switch: 0
  });

  useEffect(() => {
    if (!audioRef.current) {
      // Initialize Web Audio API for ultra-low latency clicks
      const initWebAudio = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          webAudioRef.current.context = audioContext;
          
          // Load all sounds as AudioBuffers for instant playback
          const loadAudioBuffer = (url: string, soundType: keyof WebAudioBuffers) => {
            fetch(url)
              .then(response => response.arrayBuffer())
              .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
              .then(audioBuffer => {
                webAudioRef.current.buffers[soundType] = audioBuffer;
              })
              .catch(() => {
                // Silent fail for buffer loading
              });
          };
          
          loadAudioBuffer('/audio/click1.ogg', 'click');
          loadAudioBuffer('/audio/rollover5.ogg', 'rollover');
          loadAudioBuffer('/audio/switch24.ogg', 'switch');
        } catch (error) {
          // Web Audio API not supported, will use HTML Audio fallback
        }
      };
      
      // Initialize on first user interaction
      const initOnInteraction = () => {
        initWebAudio();
        document.removeEventListener('click', initOnInteraction);
        document.removeEventListener('keydown', initOnInteraction);
        document.removeEventListener('touchstart', initOnInteraction);
      };
      
      document.addEventListener('click', initOnInteraction);
      document.addEventListener('keydown', initOnInteraction);
      document.addEventListener('touchstart', initOnInteraction);
      
      // Create multiple instances of each audio for rapid-fire clicking (fallback)
      audioRef.current = {
        click: Array(4).fill(null).map(() => new Audio('/audio/click1.ogg')),
        rollover: Array(2).fill(null).map(() => new Audio('/audio/rollover5.ogg')),
        switch: Array(2).fill(null).map(() => new Audio('/audio/switch24.ogg'))
      };

      // Configure all audio instances for immediate playback
      Object.values(audioRef.current).flat().forEach((audio, index) => {
        audio.volume = 0.3;
        audio.preload = 'auto';
        
        // Aggressively optimize for low latency
        audio.load();
        
        // Set properties for instant playback
        audio.muted = false;
        audio.preservesPitch = false;
        
        // Handle loading completion
        audio.addEventListener('canplaythrough', () => {
          // Audio is fully loaded and ready
          audio.currentTime = 0;
        });
        
        // Prime the audio context on first interaction
        const primeAudio = () => {
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise) {
              playPromise.then(() => {
                // Immediately pause and reset for actual use
                setTimeout(() => {
                  audio.pause();
                  audio.currentTime = 0;
                }, 1);
              }).catch(() => {
                // Silent fail during priming
              });
            }
          }
        };
        
        // Multiple event listeners to ensure priming happens
        document.addEventListener('click', primeAudio, { once: true });
        document.addEventListener('keydown', primeAudio, { once: true });
        document.addEventListener('touchstart', primeAudio, { once: true });
      });
    }
  }, []);

  const playSound = (soundType: SoundType) => {
    // Use Web Audio API for ultra-low latency on all sounds
    if (webAudioRef.current.context && webAudioRef.current.buffers[soundType]) {
      try {
        const audioContext = webAudioRef.current.context;
        
        // Resume audio context if it's suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            playWebAudio(soundType);
          }).catch(() => {
            playHTMLAudio(soundType);
          });
          return;
        }
        
        playWebAudio(soundType);
        return; // Exit early, we've played the sound
      } catch (error) {
        // Fall through to HTML Audio fallback
      }
    }
    
    playHTMLAudio(soundType);
  };
  
  const playWebAudio = (soundType: SoundType) => {
    const audioContext = webAudioRef.current.context!;
    const audioBuffer = webAudioRef.current.buffers[soundType]!;
    
    const bufferSource = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    bufferSource.buffer = audioBuffer;
    gainNode.gain.value = 0.3; // Match the volume from HTML Audio
    
    bufferSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    bufferSource.start(0);
  };
  
  const playHTMLAudio = (soundType: SoundType) => {
    if (!audioRef.current) {
      return;
    }
    
    const audioArray = audioRef.current[soundType];
    if (audioArray && audioArray.length > 0) {
      // Use round-robin to prevent overlapping issues
      const currentIndex = indexRef.current[soundType];
      const audio = audioArray[currentIndex];
      
      // Move to next audio instance for next play
      indexRef.current[soundType] = (currentIndex + 1) % audioArray.length;
      
      if (audio) {
        // Reset to start immediately
        audio.currentTime = 0;
        
        // Play without waiting
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silent fail if audio play is prevented
          });
        }
      }
    }
  };

  return { playSound };
}

