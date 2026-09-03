// The package entry point registers the standalone editor contributions, unlike
// the monaco-editor/editor entry point which only exposes the API. Without them
// the editor has no suggest widget, hover, or find support, so the schema-aware
// autocomplete never renders. Embedding applications supply their own instance
// through @monaco-editor/react and are unaffected by this file.
export * from 'monaco-editor'
