let bgm: HTMLAudioElement | null = null;

function build() {
  const audio = new Audio("/onsei.mp3");
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = "auto";
  bgm = audio;
}

export function setSound(next: boolean) {
  if (!bgm) build();
  if (!bgm) return;

  bgm.volume = 0.5;

  if (next) {
    void bgm.play().catch(() => {
      // Browsers may reject playback outside a direct user gesture.
    });
    return;
  }

  bgm.pause();
}

export function startAudio() {
  setSound(true);
}
