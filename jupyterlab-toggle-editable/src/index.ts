import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { INotebookTools } from '@jupyterlab/notebook';

const plugin: JupyterFrontEndPlugin<void> = {
	activate,
	id: 'jupyterlab-toggle-editable:buttonPlugin',
	requires: [INotebookTools],
	autoStart: true
};

function activate (app: JupyterFrontEnd, cellTools: INotebookTools) {
	const commandID = 'toggle-editable';
	app.commands.addCommand(commandID, {
		label: 'Toggle Read Only',
		execute: () => {
			let activeCell = cellTools.activeCell;
			activeCell.readOnly = !activeCell.readOnly;
		}
	});

	app.contextMenu.addItem({
		command: commandID,
		selector: '.jp-Cell'
	});
}

export default plugin;
