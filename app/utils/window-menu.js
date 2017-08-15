import Ember from 'ember';
import ENV from 'ghost-desktop/config/environment';

const {$} = Ember;

/**
 * Functions
 */

/**
 * Reloads the currently focused window
 *
 * @export
 * @param item - The menu item calling
 * @param {Electron.BrowserWindow} focusedWindow - The currently focussed window
 */
export function reload(item, focusedWindow) {
    if (focusedWindow && (process.platform !== 'darwin' || ENV.environment === 'test')) {
        focusedWindow.reload();
    } else {
        const {ipcRenderer} = require('electron');
        ipcRenderer.send('soft-restart-requested', true);
    }
}

/**
 * Toggles fullscreen on the currently focused window
 *
 * @export
 * @param item (description) * @param item - The menu item calling
 * @param {Electron.BrowserWindow} focusedWindow - The currently focussed window focusedWindow (description)
 */
export function toggleFullscreen(item, focusedWindow) {
    if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    }
}

/**
 * Toggles the developer tools on the currently focused window
 *
 * @export
 * @param item - The menu item calling
 * @param {Electron.BrowserWindow} focusedWindow - The currently focussed window
 */
export function toggleDevTools(item, focusedWindow) {
    if (focusedWindow) {
        focusedWindow.toggleDevTools();
    }
}

/**
 * Attempts to toggle developer tools for the currently visible Ghost instance
 *
 * @export
 * @param item - The menu item calling
 * @param {Electron.BrowserWindow} focusedWindow - The currently focussed window
 */
export function toggleGhostDevTools(item, focusedWindow) {
    if (focusedWindow) {
        const host = $('div.instance-host.selected');
        const webviews = host ? $(host).find('webview') : null;

        if (!webviews || !webviews[0]) {
            return;
        }

        if (webviews[0].isDevToolsOpened()) {
            webviews[0].closeDevTools();
        } else {
            webviews[0].openDevTools();
        }
    }
}

/**
 * Opens the issues on GitHub in the OS default browser
 *
 * @export
 */
export function openReportIssues() {
    requireNode('electron').shell.openExternal('http://github.com/tryghost/ghost-desktop/issues');
}

/**
 * Opens the repository on GitHub in the OS default browser
 *
 * @export
 */
export function openRepository() {
    requireNode('electron').shell.openExternal('http://github.com/tryghost/ghost-desktop');
}

/**
 * Setups the window menu for the application
 *
 * @export
 * @returns {Electron.Menu} - Built Menu
 */
export function setup() {
    const {remote, ipcRenderer} = requireNode('electron');
    const browserWindow = remote.getCurrentWindow();

    const template = [
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    /**
                     * (description)
                     *
                     * @param item (description)
                     * @param focusedWindow (description)
                     */
                    click(item, focusedWindow) {
                        reload(item, focusedWindow);
                    }
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: (process.platform === 'darwin') ? 'Ctrl+Command+F' : 'F11',
                    click: toggleFullscreen
                }
            ]
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                }
            ]
        },
        {
            label: 'Developer',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: (process.platform === 'darwin') ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: toggleDevTools
                },
                {
                    label: 'Toggle Developer Tools (Current Blog)',
                    accelerator: (process.platform === 'darwin') ? 'Alt+Command+Shift+I' : 'Ctrl+Alt+Shift+I',
                    click: toggleGhostDevTools
                },
                {
                    label: 'Repository',
                    click: openRepository
                }
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: openRepository
                },
                {
                    label: 'Report Issues',
                    click: openReportIssues
                }
            ]
        }
    ];

    const templateFile = {
            label: 'File',
            submenu: [
                {
                    // The click action gets injected from gh-switcher.
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click() {
                        ipcRenderer.send('shutdown-requested', true);
                        browserWindow.close();
                    }
                }
            ]
    };

    const templateHelp = [
            {
                type: 'separator'
            },
            {
                label: 'About Ghost',
                role: 'about'
            }
        ];

    if (process.platform === 'darwin') {
        // Mac OS is a special snowflake.
        template.unshift({
            label: 'Ghost',
            submenu: [
                {
                    label: 'About Ghost',
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    // The click action gets injected from gh-switcher
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    label: `Hide ${name}`,
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Alt+H',
                    role: 'hideothers'
                },
                {
                    label: 'Show All',
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click() {
                        ipcRenderer.send('shutdown-requested', true);
                        browserWindow.close();
                    }
                }
            ]
        });
    } else if (process.platform === 'linux') {
        template.find((i) => i.label === 'Window').submenu.splice(1, 0, {
            label: 'Maximize',
            //accelerator: 'CmdOrCtrl+X',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.maximize();
                }
            }
        });

        let menuHelp = template.find((i) => i.label === 'Help').submenu;
        template.find((i) => i.label === 'Help').submenu = menuHelp.concat(templateHelp);
        template.unshift(templateFile);
    } else if (process.platform === 'win32') {
        template.find((i) => i.label === 'Window').submenu.splice(1, 0, {
            label: 'Maximize',
            //accelerator: 'CmdOrCtrl+X',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.maximize();
                }
            }
        });

        let menuHelp = template.find((i) => i.label === 'Help').submenu;
        template.find((i) => i.label === 'Help').submenu = menuHelp.concat(templateHelp);
        template.unshift(templateFile);
    }

    return template;
}
