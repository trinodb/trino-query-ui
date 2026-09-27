// The package entry point registers the standalone editor contributions, unlike
// the monaco-editor/editor entry point which only exposes the API. Without them
// the editor has no suggest widget, hover, or find support, so the schema-aware
// autocomplete never renders. Embedding applications supply their own instance
// through @monaco-editor/react and are unaffected by this file.
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'

export * from 'monaco-editor'

// The language services registered by the package entry point ask Monaco for a
// web worker, and the request throws at startup when MonacoEnvironment is
// unset. The Trino SQL language runs entirely on the main thread, so the
// generic editor worker covers everything this example needs.
self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
