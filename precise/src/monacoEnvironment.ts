(globalThis as any).MonacoEnvironment = {
    getWorker(_moduleId: string, _label: string) {
        return new Worker(
            new URL(
                'monaco-editor/esm/vs/editor/editor.worker.js',
                import.meta.url
            ),
            { type: 'module' }
        );
    },
};