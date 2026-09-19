# Release verification — 2026-09-19

## Passed

- 8 automated Node test groups: cancellation, phase identities, comb zero-delay and null/peak locations, stereo folding, hard-pan counterexample, deterministic source bounds, and the single-animation-loop resize regression.
- 17 silent `OfflineAudioContext` checks in the desktop in-app Chromium browser, using the live app's `createVoice` graph:
  - 44.1 and 48 kHz: 0° baseline RMS, 180° null, 90° ratio, 360° return and A-only reference.
  - 2 ms comb output compared with an independent sample-delay oracle: RMS residual `5.09e-9` at 48 kHz.
  - Stereo channel difference, identical mono channels, actual L/R arithmetic fold, retained Mid and peak headroom. Fold residual `2.37e-9`; full-width voice peak `0.43702` before the master volume attenuation.
- All three prediction → exploration → reveal flows, playback controls, reference modes, reset, bilingual switching, language persistence and keyboard slider operation.
- 390 px embedded mobile viewport: all three English flows; 320 px narrow viewport and 200% text enlargement. No horizontal document overflow in the checked states. Layout inspected visually.
- Browser console showed no warnings or errors during app checks.
- Independent source review verified steady-state signal equations and found a canvas resize loop defect, which was fixed and regression-tested before publication.

## Scope

Verification was performed in desktop Chromium, including embedded narrow viewports. Physical iOS/Android devices and Safari/Firefox were not tested. Browser audio output was rendered and inspected numerically; perceptual quality and actual hardware sound pressure were not measured. The reduced-motion branch is implemented, but a full assistive-technology audit was not performed.

No external samples, fonts, libraries or analytics are loaded by the app. Generated music is original to this project.

## Reproduce

```sh
node --test tests/*.test.mjs
python3 -m http.server 4187
```

Open `http://localhost:4187/tests/rendered-audio.html` and press **Run audio checks**. For the responsive harness, use `http://localhost:4187/tests/responsive.html`.
