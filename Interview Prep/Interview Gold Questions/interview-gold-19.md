# 🚀 Interview Gold – Batch #19 (AI & ML in Frontend Gold)

---

## 1. On-Device Inference (TensorFlow\.js / ONNX / WebGPU)

**Problem:**

* Traditional ML = server-side inference → high latency, privacy risks.
* Sending raw data (images, audio) to backend can violate compliance.

**Solution:**

* Run ML **directly in the browser/device** with frameworks like **TensorFlow\.js, ONNX.js, WebGPU acceleration**.

**Detailed Design:**

```js
import * as tf from "@tensorflow/tfjs";

// Load a pre-trained model
const model = await tf.loadLayersModel("/model.json");

// Run inference on image
const imgTensor = tf.browser.fromPixels(img).resizeNearestNeighbor([224,224]).toFloat().expandDims();
const prediction = model.predict(imgTensor);
```

* **Execution backends**:

  * WebGL (GPU).
  * WebGPU (faster, experimental).
  * WASM (CPU fallback).

**Performance/Scaling Notes:**

* No network latency.
* Scales with user hardware.
* Battery/CPU usage may spike on weaker devices.

**Pitfalls:**

* Larger models (\~50MB+) = slow load times.
* Not all browsers support WebGPU yet.

**Real-world Example:**

* Google Teachable Machine → train & run models in browser.
* Figma using on-device ML for auto-suggestions.

**Follow-ups:**

* Why on-device vs server inference? → Latency + privacy.
* How do you shrink large models? → Quantization, pruning, distillation.
* Why use WASM backend? → Wider browser support, stable perf.

---

## 2. Personalization in Frontend

**Problem:**

* Users expect **personalized recommendations, layouts, themes**.
* Pure backend personalization = latency + limited context of real-time behavior.

**Solution:**

* Frontend tracks lightweight signals (clicks, time spent, scroll depth).
* Local ML/heuristics adapt UI instantly.

**Detailed Design:**

* Example: news feed personalization.

```js
const signals = { sportsClicks: 12, politicsClicks: 3 };
if (signals.sportsClicks > signals.politicsClicks) {
  prioritizeCategory("Sports");
}
```

* For ML:

  * Use local k-means clustering on browsing patterns.
  * Or tiny recommender model in TensorFlow\.js.

**Performance/Scaling Notes:**

* Local personalization → zero backend latency.
* Sync signals to backend later for analytics.

**Pitfalls:**

* Risk of over-personalization (filter bubbles).
* Privacy concerns → must avoid PII leaks.

**Real-world Example:**

* Netflix: frontend tracks hover previews, adjusts recommendations in session.
* Spotify: local caching of listening patterns for instant personalization.

**Follow-ups:**

* How do you balance personalization vs exploration? → Mix with randomization.
* Why local vs server personalization? → Instant feedback, offline-capable.
* How to avoid filter bubble? → Diversity constraints.

---

## 3. AI-Driven UIs (Smart Inputs & Assistants)

**Problem:**

* Traditional UIs are static; users expect **AI-powered features** like autocomplete, smart search, assistants.

**Solution:**

* Use lightweight AI in frontend for UX improvements:

  * Autocomplete & smart search.
  * AI-powered chatbots.
  * Document summarization.

**Detailed Design:**

* Example: autocomplete with ML re-ranking.

```js
const suggestions = ["apple", "apricot", "banana"];
const ranked = rankByContext(suggestions, userHistory);
```

* Use Web Workers to keep inference off main thread.

**Performance/Scaling Notes:**

* Improves UX, reduces typing/clicks.
* Worker isolation → prevents UI jank.

**Pitfalls:**

* Poor model quality → frustrates users.
* Must fallback gracefully when model not loaded.

**Real-world Example:**

* Gmail Smart Compose → predicts entire phrases.
* Figma AI: auto-generates designs based on text prompts.

**Follow-ups:**

* Why run inference in Web Worker? → Keep UI responsive.
* How to fallback if model fails? → Rule-based baseline.
* What’s the tradeoff: large vs small models? → Accuracy vs latency.

---

## 4. Privacy-Preserving ML (Federated Learning, Edge AI)

**Problem:**

* Sending raw user data to server (images, keystrokes) violates GDPR/CCPA.
* Need ML while keeping data private.

**Solution:**

* **Federated learning**: model updates happen locally, only gradients sent to server.
* **Edge inference**: predictions only local, no cloud needed.

**Detailed Design:**

* Example: keyboard suggestions.

  * Local model learns from typing.
  * Sends only anonymized weight updates → aggregated globally.

```js
// Pseudo federated update
localModel.train(userData);
sendGradientsToServer(localModel.getGradients());
```

**Performance/Scaling Notes:**

* Reduces central data collection.
* Local compute cost → may drain battery.

**Pitfalls:**

* Requires privacy-preserving aggregation (Secure Aggregation, DP).
* Model drift possible if users vary widely.

**Real-world Example:**

* Google Gboard → on-device training for better autocorrect.
* Apple → on-device Siri learning.

**Follow-ups:**

* How federated learning different from edge inference?
* How to secure gradient sharing? → Differential privacy, secure aggregation.
* Tradeoffs of federated vs centralized ML? → Privacy vs consistency.

---

## 5. Edge AI in PWAs (Offline AI)

**Problem:**

* Users often go offline (travel, weak networks).
* Still want smart features (translation, OCR, search).

**Solution:**

* **Bundle ML models inside PWA** → works offline.
* Store in IndexedDB or Cache API.

**Detailed Design:**

```js
// Install service worker to cache model
caches.open("models").then(cache => cache.add("/models/ocr-model.json"));
```

* Use tfjs + WebAssembly backend → works even without GPU.

**Performance/Scaling Notes:**

* Enables AI in airplane mode.
* Cache size limited (\~50MB typical on web).

**Pitfalls:**

* Models too large → slow install.
* Updating cached models tricky.

**Real-world Example:**

* Google Translate PWA → offline translation packs.
* Notion AI: some summarization works offline.

**Follow-ups:**

* Why IndexedDB for models? → Large binary storage.
* What’s biggest offline limitation? → Storage quotas differ by browser.
* How to keep models updated? → Service worker cache-busting.

---

## 6. Real-Time AI (Streaming Models)

**Problem:**

* Some AI needs **real-time responses** (voice, video, gesture).
* Latency >200ms breaks UX.

**Solution:**

* Use **WebRTC + on-device inference**.
* Models optimized for streaming (tiny audio/text models).

**Detailed Design:**

* Example: live speech recognition.

```js
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => runStreamingModel(stream));
```

* Incremental inference → don’t wait for full audio.

**Performance/Scaling Notes:**

* Must run at \~30–60fps for video models.
* GPU acceleration critical (WebGPU, WebGL).

**Pitfalls:**

* Battery drain high.
* Browsers may block mic/camera for privacy.

**Real-world Example:**

* Zoom real-time transcription.
* Snap AR lenses using ML at 60fps.

**Follow-ups:**

* How do you keep real-time inference under 200ms? → Optimize model + hardware acceleration.
* Why streaming better than batch? → Reduces end-to-end latency.
* What tradeoffs in AR/VR AI? → Frame rate vs accuracy.

---

# 📘 Key Takeaways – Batch #19

* **On-device inference** → low latency, privacy, but model size tradeoff.
* **Personalization** → local signals = instant feedback.
* **AI-driven UI** → autocomplete, assistants, smart UX.
* **Privacy-preserving ML** → federated learning, differential privacy.
* **Edge AI in PWAs** → offline smart apps.
* **Real-time AI** → voice, video, AR/VR under 200ms.

---

# 📑 Quick-Reference (Batch #19)

* **On-device ML**: TF.js, ONNX, WebGPU.
* **Personalization**: lightweight local models.
* **AI UI**: autocomplete, summarization.
* **Privacy**: federated learning, DP.
* **Edge AI**: cache models in PWA.
* **Real-time**: WebRTC + streaming models.
