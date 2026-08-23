# Clyra Gemini model audit

The official Gemini model documentation states that `gemini-2.0-flash` is shut down and lists `gemini-3.6-flash` as a stable supported model. The official source is https://ai.google.dev/gemini-api/docs/models, accessed during the audit. The release notes at https://ai.google.dev/gemini-api/docs/changelog state that Gemini 2.0 models were shut down on June 1, 2026 and recommend newer models. Clyra active server-side calls were updated to `gemini-3.6-flash`; API keys remain server-side.

The source repository had old model strings in Market Suggestion, shared intelligence, Review Report, Performance, Chat, Reports, and Upload actions. They have been replaced in source code with `gemini-3.6-flash` for the active runtime calls. No Clyra browser code exposes `GEMINI_API_KEY`.

The current Gemini request pattern remains the existing `v1beta/models/{model}:generateContent` endpoint with POST and `x-goog-api-key`; structured response schemas were preserved for the intelligence modules.
