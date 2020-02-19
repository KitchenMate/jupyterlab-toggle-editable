import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the jupyterlab-toggle-editable extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-toggle-editable',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-toggle-editable is activated!');
  }
};

export default extension;
