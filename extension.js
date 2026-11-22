import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Keyboard from 'resource:///org/gnome/shell/ui/status/keyboard.js';

import {
    Extension
} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class LayoutOsdExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._inputSourceManager = Keyboard.getInputSourceManager();
        this._popups = new Set();
        this._timeout = null;
        this._signalId = this._inputSourceManager.connect(
            'current-source-changed',
            () => this._showLayout()
        );
        this._testPopupSignalId = this._settings.connect(
            'changed::test-popup',
            () => this._showPopup('TEST')
        );
    }

    disable() {
        if (this._signalId !== null) {
            this._inputSourceManager.disconnect(this._signalId);
            this._signalId = null;
        }

        if (this._testPopupSignalId !== null) {
            this._settings.disconnect(this._testPopupSignalId);
            this._testPopupSignalId = null;
        }

        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }

        this._destroyPopups();
        this._popups = null;
        this._inputSourceManager = null;
        this._settings = null;
    }

    _destroyPopups() {
        for (const popup of this._popups)
            popup.destroy();
    }

    _showLayout() {
        const source = this._inputSourceManager.currentSource;
        if (!source)
            return;

        this._showPopup(this._getLayoutText(source));
    }

    _getLayoutText(source) {
        const shortName = source.shortName || source.id;
        const fullName = source.displayName || shortName;

        switch (this._settings.get_string('display-mode')) {
        case 'localized':
            // GNOME adds layout variants in parentheses, for example “English (US)”.
            return fullName.replace(/\s+\([^()]*\)$/, '');
        case 'full':
            return fullName;
        case 'short':
        default:
            return shortName.toUpperCase();
        }
    }

    _showPopup(text) {
        const backgroundStyle = this._settings.get_string('background-style');
        const black = backgroundStyle === 'black';
        const dark = black || backgroundStyle === 'dark' || (backgroundStyle === 'system' &&
            St.Settings.get().colorScheme === St.SystemColorScheme.PREFER_DARK);
        let backgroundColor = dark ? '36, 36, 40' : '248, 248, 249';
        if (black)
            backgroundColor = '0, 0, 0';

        const textColor = dark ? '255, 255, 255' : '37, 37, 42';
        const backgroundOpacity = this._settings.get_int('background-opacity') / 100;
        const textOpacity = this._settings.get_int('text-opacity') / 100;
        const style = `background-color: rgba(${backgroundColor}, ${backgroundOpacity});` +
            `color: rgba(${textColor}, ${textOpacity});`;
        const verticalPosition = this._settings.get_int('vertical-position') / 100;
        const monitors = this._settings.get_boolean('all-monitors')
            ? Main.layoutManager.monitors
            : [Main.layoutManager.primaryMonitor].filter(Boolean);

        this._destroyPopups();
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        if (monitors.length === 0)
            return;

        for (const monitor of monitors) {
            const popup = new St.Label({
                text,
                style_class: 'layout-osd-popup',
                style,
                opacity: 0,
            });

            this._popups.add(popup);
            popup.connect('destroy', () => this._popups.delete(popup));
            Main.uiGroup.add_child(popup);
            popup.get_clutter_text().set_line_wrap(false);

            const [, , popupWidth, popupHeight] = popup.get_preferred_size();

            // Interpolate within the usable area so the label stays on-screen.
            popup.set_position(
                monitor.x + (monitor.width - popupWidth) / 2,
                monitor.y + (monitor.height - popupHeight) * verticalPosition
            );

            popup.ease({
                opacity: 255,
                duration: 150,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            });
        }

        this._timeout = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            this._settings.get_double('hide-delay') * 1000,
            () => {
                this._timeout = null;
                const duration = this._settings.get_int('fade-duration');
                for (const popup of this._popups) {
                    popup.ease({
                        opacity: 0,
                        duration,
                        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
                        onComplete: () => popup.destroy(),
                    });
                }

                return GLib.SOURCE_REMOVE;
            }
        );
    }
}
