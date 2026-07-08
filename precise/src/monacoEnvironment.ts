import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

(globalThis as any).MonacoEnvironment = {
    getWorker(_moduleId: string, _label: string) {
        return new editorWorker()
    },
}