# Mio Sound Lab — 声音小实验室 🎛️

**Make a guess. Move a slider. Hear the science.**

[Open the lab / 打开实验室](https://the06tj.github.io/mio-sound-lab/)

Three small, bilingual listening experiments about phenomena that are easy to misunderstand:

| Experiment | Try it | Discover |
| --- | --- | --- |
| 01 · The disappearing sound / 消失的声音 | Move the relative phase of two 220 Hz sine waves | Equal, opposite signals cancel at 180° |
| 02 · One millisecond later / 一毫秒之后 | Mix noise with a copy delayed by 0–10 ms | A short delay creates a comb of spectral notches |
| 03 · Where did the width go? / 宽度去哪儿了？ | Switch an original Mid/Side arrangement to mono | Opposite-polarity Side cancels; shared Mid remains |

Each experiment follows **predict → explore → reveal**. Native sliders support keyboard and touch. Presets make exact comparisons easy. The responsive interface offers 中文 / EN, reduced-motion support, explicit playback and conservative default volume.

## Run locally

No dependencies, build step, account or API keys.

```sh
python3 -m http.server 4186 --directory dist
```

Open http://localhost:4186 in a modern browser. ES modules require HTTP/HTTPS; opening `index.html` directly with `file://` is not supported.

## Tests

Node.js 20 or later:

```sh
node --test tests/*.test.mjs
```

For silent, real Web Audio output checks, serve the repository root:

```sh
python3 -m http.server 4187
```

Open http://localhost:4187/tests/rendered-audio.html and select **Run audio checks**. This renders the same audio graph as the app with `OfflineAudioContext` and checks 17 outcomes, including 44.1/48 kHz sine cancellation, the delayed-signal oracle, actual stereo folding, and headroom. The Node suite covers 7 groups of mathematical and source-generation checks. See [VALIDATION.md](VALIDATION.md) for the release verification scope.

## Signal design

- **Phase:** `y = [sin(ωt) + sin(ωt + φ)] / 2`. Synchronized sine and cosine oscillators implement the sum. A-only is a unity-gain reference, so the 0° sum matches its amplitude.
- **Comb:** `y(t) = [x(t) + x(t − τ)] / 2`. A deterministic broadband noise loop is low-pass filtered at 6.5 kHz before splitting. At nonzero delay, nulls occur at `(2k + 1) / (2τ)`. At zero delay the response is flat. The plot shows the theoretical comb transfer function, not the source spectrum. A changing delay can create a brief pitch sweep while being adjusted.
- **Stereo:** `L = (M + wS)/2`, `R = (M − wS)/2`; averaged mono is `M/2`. M is an original synthesized melody; S is an original high pitched texture. Mono mode is implemented by the algebraically equivalent removal of S, with no Mid gain change.
- **Output:** Fixed master scale `0.3 × volume`; default volume is 25%. Gain changes are smoothed, playback fades in/out, and experiment changes and page hiding stop playback. Actual listening level depends on your device: begin with its volume low.

The waveforms are illustrations, not an oscilloscope recording. Phase and comb plots keep showing the model when listening to the A-only/dry reference; the interface states this explicitly. The stereo graph uses illustrative waveforms instead of the full musical source.

## Privacy & boundaries

Audio is generated in your browser. No microphone permission, audio uploads, analytics scripts, external fonts or remote samples. Only the language preference is stored locally. GitHub Pages serves the static files and can keep normal hosting access logs.

These are idealized signal demonstrations, not acoustic room simulations, calibrated meters or hearing tests. Two speakers do not cancel everywhere in a room. Side is not synonymous with every sound panned away from center. Headphones and device stereo output are recommended for experiment three. Visual exploration remains possible without audio.

## Source layout

- `dist/`: complete static app; authored files, no generated build output
- `tests/`: pure-model tests and a browser-rendered audio test page
- `.github/workflows/pages.yml`: tests and GitHub Pages deployment; only `dist/` is published

Enable GitHub Pages with **Source: GitHub Actions**. Pushes to `main` run the numerical tests before deploying.

## References

- [Ableton Learning Synths](https://learningsynths.ableton.com/) — interactive listening inspiration
- [Julius O. Smith, Physical Audio Signal Processing: Comb Filters](https://www.dsprelated.com/freebooks/pasp/Comb_Filters.html)
- [DPA: Mid/Side recording](https://www.dpamicrophones.com/dictionary/m/ms-recording/)
- [Ableton Live manual: Utility](https://www.ableton.com/en/live-manual/12/live-audio-effect-reference/#utility)

All sounds are synthesized by this project. No Ableton code, branding or audio assets are used. Not affiliated with Ableton.

## Contributors

Made by [Tim (@The06tj)](https://github.com/The06tj) & [Mio (@Mio0817)](https://github.com/Mio0817).

Tim is the project owner and maintainer. Mio is the AI assistant used through OpenAI Codex for implementation, documentation, and testing.

## 贡献者

由 [Tim (@The06tj)](https://github.com/The06tj) 与 [Mio (@Mio0817)](https://github.com/Mio0817) 共同制作。

Tim 是项目所有者与维护者。Mio 是通过 OpenAI Codex 参与实现、文档与测试的 AI 助手。

## License

MIT. See [LICENSE](LICENSE).
