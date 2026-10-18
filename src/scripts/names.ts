// "My name in every language": plays the pre-generated (or recorded) clips.
// One clip at a time; clicking the playing row again stops it.

export function startNames(root: HTMLElement) {
  const rows = [...root.querySelectorAll<HTMLElement>("[data-audio]")];
  let current: { row: HTMLElement; audio: HTMLAudioElement } | null = null;

  const stop = () => {
    if (!current) return;
    current.audio.pause(); current.audio.currentTime = 0;
    current.row.classList.remove("speaking");
    current.row.querySelector("button")!.setAttribute("aria-pressed", "false");
    current = null;
  };

  rows.forEach((row) => {
    const btn = row.querySelector("button")!;
    const note = row.querySelector<HTMLElement>("[data-note]")!;
    const audio = new Audio();
    audio.preload = "none";
    audio.src = row.dataset.audio!;
    audio.addEventListener("ended", () => { if (current?.audio === audio) stop(); });
    audio.addEventListener("error", () => {
      if (current?.audio === audio) stop();
      note.textContent = "Couldn't load this clip.";
    });

    btn.addEventListener("click", async () => {
      const same = current?.row === row;
      stop();
      if (same) return;
      current = { row, audio };
      row.classList.add("speaking"); btn.setAttribute("aria-pressed", "true");
      try { await audio.play(); note.textContent = ""; }
      catch { if (current?.audio === audio) stop(); note.textContent = "Couldn't play this clip on your device."; }
    });
  });
}
