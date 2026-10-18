// "My name in every language": speaks each rendering with the browser's
// text-to-speech (Web Speech API), using a voice for that language when the
// device has one. Missing voices fall back to the default voice with a note;
// browsers without speech support get disabled buttons that say why.

export function startNames(root: HTMLElement) {
  const rows = [...root.querySelectorAll<HTMLElement>("[data-speak]")];
  const status = root.querySelector<HTMLElement>("[data-status]")!;
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;

  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    rows.forEach((r) => {
      const b = r.querySelector("button")!;
      b.disabled = true;
      b.title = "Your browser doesn't support text-to-speech";
    });
    status.textContent = "Your browser doesn't support text-to-speech, so the names can't be played here.";
    return;
  }

  let voices: SpeechSynthesisVoice[] = [];
  const load = () => { voices = synth.getVoices(); };
  load();
  synth.addEventListener?.("voiceschanged", load);

  // Hebrew voices sometimes use the legacy "iw" code.
  const base = (lang: string) => lang.toLowerCase().split(/[-_]/)[0].replace(/^iw$/, "he");
  function pick(lang: string) {
    const exact = voices.find((v) => v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase());
    return exact ?? voices.find((v) => base(v.lang) === base(lang)) ?? null;
  }

  let active: HTMLElement | null = null;
  const stop = () => { active?.classList.remove("speaking"); active?.querySelector("button")?.setAttribute("aria-pressed", "false"); active = null; };

  rows.forEach((row) => {
    const btn = row.querySelector("button")!;
    const note = row.querySelector<HTMLElement>("[data-note]")!;
    btn.addEventListener("click", () => {
      const wasActive = active === row;
      synth.cancel(); stop();
      if (wasActive) return; // second click stops it

      const lang = row.dataset.speak!;
      const u = new SpeechSynthesisUtterance(row.dataset.text!);
      u.lang = lang; u.rate = 0.9;
      const voice = pick(lang);
      if (voice) { u.voice = voice; note.textContent = ""; }
      else note.textContent = voices.length ? `No ${row.dataset.label} voice on this device, so this uses your default voice.` : "Using your device's default voice.";

      u.onstart = () => { active = row; row.classList.add("speaking"); btn.setAttribute("aria-pressed", "true"); };
      u.onend = () => { if (active === row) stop(); };
      u.onerror = (e) => {
        if (active === row) stop();
        if (e.error !== "canceled" && e.error !== "interrupted") note.textContent = "Couldn't play this one on your device.";
      };
      synth.speak(u);
    });
  });
}
