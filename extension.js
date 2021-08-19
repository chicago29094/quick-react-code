// Required for the vscode extension
const vscode = require('vscode');

// Required components for the Quick-React extension
const {NaryNode, NaryTree} = require('./utility/NaryTree');
const {QuickReactElement, QuickReact} = require('./utility/QuickReact');
const fs = require('fs');
const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quick-react-code" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('quick-react-code.quickReact', function () {
		// The code you place here will be executed every time your command is executed

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
	
		if (editor) {
			const document = editor.document;
			const quickReactMarkupCode = document.getText();
			// const selection = editor.selection;
			// vscode.window.showErrorMessage('Something has gone terribly terribly wrong.');
			// vscode.window.showWarningMessage('Something has gone wrong, but it will be ok.');
			// vscode.window.showInformationMessage('Relax, this is just some information for you.');

			const quickReact = new QuickReact();
			let componentTree = {};
			try {
				componentTree = quickReact.parseMarkup(quickReactMarkupCode);
			}
			catch(error) {
				//console.log(error)
				if (error instanceof TypeError) {
					vscode.window.showErrorMessage(`Your Quick-React markup could not be parsed. ${error}`);
				} 
				else if (error instanceof SyntaxError) {
					vscode.window.showErrorMessage(`Your Quick-React markup could not be parsed. ${error}`);
				} 
				return;
			}

			try {
				quickReact.generateProjectFiles(componentTree);
			}
			catch(error) {
				// console.error(error)
				vscode.window.showErrorMessage(`Your Quick-React project files could not be saved.`);
			}
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
