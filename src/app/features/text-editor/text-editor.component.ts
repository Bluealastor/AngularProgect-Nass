import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FileService } from '../../core/services/file.service';

// Mappa estensione → linguaggio Monaco
function monacoLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript', js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
    json: 'json', yaml: 'yaml', yml: 'yaml', xml: 'xml', toml: 'ini',
    md: 'markdown', markdown: 'markdown',
    java: 'java', kt: 'kotlin', py: 'python', go: 'go',
    rs: 'rust', cpp: 'cpp', c: 'c', cs: 'csharp',
    php: 'php', rb: 'ruby', swift: 'swift', sh: 'shell', bash: 'shell',
    sql: 'sql', graphql: 'graphql', dockerfile: 'dockerfile',
    txt: 'plaintext', log: 'plaintext', ini: 'ini', env: 'ini',
    properties: 'ini',
  };
  return map[ext] ?? 'plaintext';
}

@Component({
  selector: 'app-text-editor',
  standalone: true,
  template: `
    <div class="editor-wrap">
      <div class="bar">
        <button (click)="back()">← Indietro</button>
        <span class="name">{{ name }}</span>
        <span class="status">{{ statusMsg }}</span>
        <button class="save-btn" (click)="requestSave()" [disabled]="saving">
          {{ saving ? 'Salvataggio…' : '💾 Salva' }}
        </button>
      </div>
      <div class="iframe-wrap" #container></div>
    </div>
  `,
  styles: [`
    .editor-wrap { display: flex; flex-direction: column; height: 100vh; background: #1e1e1e; }
    .bar {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 16px; background: #111; flex-shrink: 0;
    }
    button {
      background: none; border: none; color: #fff; cursor: pointer;
      font-size: 14px; padding: 4px 10px; border-radius: 6px;
      &:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
      &:disabled { opacity: 0.5; cursor: default; }
    }
    .save-btn { background: #0e639c; border-radius: 6px; padding: 4px 14px; }
    .name { flex: 1; color: rgba(255,255,255,0.7); font-size: 13px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status { font-size: 12px; color: #4caf50; white-space: nowrap; min-width: 80px; text-align: right; }
    .iframe-wrap { flex: 1; }
    iframe { width: 100%; height: 100%; border: none; }
  `],
})
export class TextEditorComponent implements OnInit, OnDestroy {
  private route    = inject(ActivatedRoute);
  private location = inject(Location);
  private fileSvc  = inject(FileService);

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  name      = '';
  path      = '';
  statusMsg = '';
  saving    = false;

  private iframe!: HTMLIFrameElement;
  private editorReady = false;
  private pendingContent: string | null = null;

  ngOnInit(): void {
    this.path = this.route.snapshot.queryParamMap.get('path') ?? '';
    this.name = this.route.snapshot.queryParamMap.get('name') ?? '';

    this.buildIframe();
    window.addEventListener('message', this.onMessage);
    this.loadContent();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onMessage);
    if (this.iframe?.src?.startsWith('blob:')) URL.revokeObjectURL(this.iframe.src);
  }

  private buildIframe(): void {
    const lang = monacoLanguage(this.name);
    const html = this.buildHtml(lang);
    const blob = new Blob([html], { type: 'text/html' });
    this.iframe = document.createElement('iframe');
    this.iframe.src = URL.createObjectURL(blob);
    this.iframe.style.cssText = 'width:100%;height:100%;border:none;';
    this.containerRef.nativeElement.appendChild(this.iframe);
  }

  private loadContent(): void {
    this.fileSvc.getContent(this.path).subscribe({
      next: ({ content }) => {
        if (this.editorReady) {
          this.sendContent(content);
        } else {
          this.pendingContent = content;
        }
      },
      error: () => { this.statusMsg = '⚠ Errore caricamento'; },
    });
  }

  private sendContent(content: string): void {
    this.iframe.contentWindow?.postMessage({ type: 'SET_CONTENT', content }, '*');
  }

  requestSave(): void {
    this.iframe.contentWindow?.postMessage({ type: 'SAVE_REQUEST' }, '*');
  }

  private onMessage = (e: MessageEvent): void => {
    if (e.data?.type === 'EDITOR_READY') {
      this.editorReady = true;
      if (this.pendingContent !== null) {
        this.sendContent(this.pendingContent);
        this.pendingContent = null;
      }
    }
    if (e.data?.type === 'SAVE_CONTENT') {
      this.saving = true;
      this.statusMsg = '';
      this.fileSvc.saveContent(this.path, e.data.content).subscribe({
        next: () => { this.saving = false; this.statusMsg = '✓ Salvato'; setTimeout(() => this.statusMsg = '', 2500); },
        error: () => { this.saving = false; this.statusMsg = '⚠ Errore salvataggio'; },
      });
    }
  };

  back(): void { this.location.back(); }

  private buildHtml(language: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #1e1e1e; overflow: hidden; }
  #container { width: 100vw; height: 100vh; }
</style>
</head>
<body>
<div id="container"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs/loader.min.js"></script>
<script>
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
  const editor = monaco.editor.create(document.getElementById('container'), {
    value: '',
    language: '${language}',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    renderWhitespace: 'selection',
  });

  window.addEventListener('message', function (e) {
    if (e.data.type === 'SET_CONTENT') {
      const pos = editor.getPosition();
      editor.setValue(e.data.content);
      if (pos) editor.setPosition(pos);
    }
    if (e.data.type === 'SAVE_REQUEST') {
      window.parent.postMessage({ type: 'SAVE_CONTENT', content: editor.getValue() }, '*');
    }
  });

  // Ctrl+S / Cmd+S → salva
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
    window.parent.postMessage({ type: 'SAVE_CONTENT', content: editor.getValue() }, '*');
  });

  window.parent.postMessage({ type: 'EDITOR_READY' }, '*');
});
</script>
</body>
</html>`;
  }
}
