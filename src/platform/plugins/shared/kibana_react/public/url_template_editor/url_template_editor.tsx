/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { css } from '@emotion/react';
import * as React from 'react';
import { useEuiTheme } from '@elastic/eui';
import { monaco, CodeEditor, HANDLEBARS_LANG_ID, type CodeEditorProps } from '@kbn/code-editor';

export interface UrlTemplateEditorVariable {
  label: string;
  title?: string;
  documentation?: string;
  kind?: monaco.languages.CompletionItemKind;
  sortText?: string;
}
export interface UrlTemplateEditorProps {
  value: string;
  height?: CodeEditorProps['height'];
  fitToContent?: CodeEditorProps['fitToContent'];
  variables?: UrlTemplateEditorVariable[];
  onChange: CodeEditorProps['onChange'];
  onEditor?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  placeholder?: string;
  Editor?: React.ComponentType<CodeEditorProps>;
}

export const UrlTemplateEditor: React.FC<UrlTemplateEditorProps> = ({
  height = 105,
  fitToContent,
  value,
  variables,
  onChange,
  placeholder,
  onEditor,
  Editor = CodeEditor,
}) => {
  const refEditor = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const handleEditor = React.useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    refEditor.current = editor;

    if (onEditor) {
      onEditor(editor);
    }
  }, []);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    const editor = refEditor.current;
    if (!editor) return;

    if (event.key === 'Escape') {
      if (editor.hasWidgetFocus()) {
        // Don't propagate Escape click if Monaco editor is focused, this allows
        // user to close the autocomplete widget with Escape button without
        // closing the EUI flyout.
        event.stopPropagation();
        editor.trigger('editor', 'hideSuggestWidget', []);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!variables) {
      return;
    }

    const { dispose } = monaco.languages.registerCompletionItemProvider(HANDLEBARS_LANG_ID, {
      triggerCharacters: ['{', '/', '?', '&', '='],
      provideCompletionItems(model, position, context, token) {
        const { lineNumber } = position;
        const line = model.getLineContent(lineNumber);
        const wordUntil = model.getWordUntilPosition(position);
        const word = model.getWordAtPosition(position) || wordUntil;
        const { startColumn, endColumn } = word;
        const range = {
          startLineNumber: lineNumber,
          endLineNumber: lineNumber,
          startColumn,
          endColumn,
        };

        const leadingMustacheCount =
          0 +
          (line[range.startColumn - 2] === '{' ? 1 : 0) +
          (line[range.startColumn - 3] === '{' ? 1 : 0);

        const trailingMustacheCount =
          0 +
          (line[range.endColumn - 1] === '}' ? 1 : 0) +
          (line[range.endColumn + 0] === '}' ? 1 : 0);

        return {
          suggestions: variables.map(
            ({
              label,
              title = '',
              documentation = '',
              kind = monaco.languages.CompletionItemKind.Variable,
              sortText,
            }) => ({
              kind,
              label,
              insertText:
                (leadingMustacheCount === 2 ? '' : leadingMustacheCount === 1 ? '{' : '{{') +
                label +
                (trailingMustacheCount === 2 ? '' : trailingMustacheCount === 1 ? '}' : '}}'),
              detail: title,
              documentation,
              range,
              sortText,
            })
          ),
        };
      },
    });

    return () => {
      dispose();
    };
  }, [variables]);

  const { euiTheme } = useEuiTheme();
  const editorStyle = css({
    '.monaco-editor .lines-content.monaco-editor-background': {
      margin: `0 ${euiTheme.size.s}`,
    },
  });

  return (
    <div data-test-subj="url-template-editor-container" css={editorStyle} onKeyDown={handleKeyDown}>
      <Editor
        languageId={HANDLEBARS_LANG_ID}
        height={height}
        fitToContent={fitToContent}
        value={value}
        onChange={onChange}
        editorDidMount={handleEditor}
        placeholder={placeholder}
        options={{
          fontSize: 14,
          renderLineHighlight: 'none',
          lineNumbers: 'off',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 2,
          quickSuggestions: {
            comments: false,
            strings: false,
            other: false,
          },
          suggestOnTriggerCharacters: true,
          minimap: {
            enabled: false,
          },
          guides: {
            highlightActiveIndentation: false,
          },
          wordWrap: 'on',
          wrappingIndent: 'none',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  );
};
