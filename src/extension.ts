'use strict'

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
  // The server is implemented in node
  let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));

  // The debug options for the server
  let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

  // If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run : { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
  }
  
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
		documentSelector: ['go'],
		synchronize: {
			// Synchronize the setting section 'langd' to the server
			configurationSection: 'langd',
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
  }

  let disposable = new LanguageClient('langd', 'Language Daemon', serverOptions, clientOptions).start();

  context.subscriptions.push(disposable);
}