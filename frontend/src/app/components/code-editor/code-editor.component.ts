import {
    Component,
    ElementRef,
    ViewChild,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    AfterViewInit,
    ChangeDetectionStrategy,
    effect,
    input
} from '@angular/core';

declare const monaco: any;

@Component({
    selector: 'app-code-editor',
    standalone: true,
    template: `<div #editorContainer class="editor-container"></div>`,
    styles: [`
        :host { display: block; }
        .editor-container { width: 100%; height: 100%; min-height: 150px; border-radius: 0.5rem; overflow: hidden; }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeEditorComponent implements AfterViewInit, OnDestroy {
    @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

    language = input<string>('json');
    theme = input<string>('vs-dark');
    readonly = input<boolean>(false);
    minimap = input<boolean>(false);

    @Input() set value(val: string) {
        if (this._value !== val) {
            this._value = val;
            if (this.editor && this.editor.getValue() !== val) {
                this.editor.setValue(val || '');
            }
        }
    }
    get value(): string { return this._value; }

    @Output() valueChange = new EventEmitter<string>();

    private _value = '';
    private editor: any;
    private static monacoLoaded = false;
    private static loadPromise: Promise<void> | null = null;


    constructor() {
        // 响应输入变化
        effect(() => {
            const lang = this.language();
            const thm = this.theme();
            const ro = this.readonly();
            const mm = this.minimap();
            if (this.editor) {
                monaco.editor.setModelLanguage(this.editor.getModel(), lang);
                monaco.editor.setTheme(thm);
                this.editor.updateOptions({ readOnly: ro, minimap: { enabled: mm } });
            }
        });
    }

    async ngAfterViewInit() {
        await this.loadMonaco();
        this.initEditor();
    }

    ngOnDestroy() {
        this.editor?.dispose();
    }

    private loadMonaco(): Promise<void> {
        if (CodeEditorComponent.monacoLoaded) {
            return Promise.resolve();
        }
        if (CodeEditorComponent.loadPromise) {
            return CodeEditorComponent.loadPromise;
        }

        CodeEditorComponent.loadPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'assets/monaco/vs/loader.js';
            script.onload = () => {
                (window as any).require.config({ paths: { vs: 'assets/monaco/vs' } });
                (window as any).require(['vs/editor/editor.main'], () => {
                    CodeEditorComponent.monacoLoaded = true;
                    resolve();
                });
            };
            document.head.appendChild(script);
        });

        return CodeEditorComponent.loadPromise;
    }

    private initEditor() {
        this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
            value: this._value,
            language: this.language(),
            theme: this.theme(),
            readOnly: this.readonly(),
            minimap: { enabled: this.minimap() },
            automaticLayout: true,
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true
        });

        this.editor.onDidChangeModelContent(() => {
            const val = this.editor.getValue();
            if (this._value !== val) {
                this._value = val;
                this.valueChange.emit(val);
            }
        });
    }

    // 格式化代码
    format() {
        this.editor?.getAction('editor.action.formatDocument')?.run();
    }
}
