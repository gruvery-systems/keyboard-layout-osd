<p align="center">
  <img src="keyboard-layout-osd-logo.png" width="160" alt="Keyboard Layout OSD logo">
</p>

# Keyboard Layout OSD

Keyboard Layout OSD shows a brief on-screen display when you switch keyboard
layouts or input languages in GNOME Shell.

<p align="center">
  <img src="keyboard-layout-osd-animation.gif" alt="Keyboard Layout OSD in action">
</p>

## Features

- Uses GNOME input-source names for any configured keyboard layout
- Short, localized, and full layout-name modes
- System, light, dark, and black popup styles with separate text and background opacity
- Configurable visibility time, fade duration, and vertical position
- Optional display on every monitor
- Built-in test button
- Native GNOME Shell and libadwaita interface

![Keyboard Layout OSD preferences and display modes](keyboard-layout-osd-screen.png)

## Requirements

- GNOME Shell 50 or 51

## Release notes

Version 4 adds GNOME Shell 51 support and separate background and text
opacity controls. When upgrading from version 3, opacity resets to the new
defaults of 90% for the background and 100% for the text. You can adjust
both values in Appearance.

## Install

Install Keyboard Layout OSD from
[GNOME Shell Extensions](https://extensions.gnome.org/extension/10919/keyboard-layout-osd/).

## NixOS

The repository provides a flake, so the extension can be installed directly
without waiting for it to reach Nixpkgs.

Add the input to your system flake:

```nix
inputs.keyboard-layout-osd = {
  url = "github:gruvery-systems/keyboard-layout-osd";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

You can test the package before adding it to a system configuration:

```bash
nix build github:gruvery-systems/keyboard-layout-osd
```

### System-wide installation

Add the NixOS module to your existing system definition:

```nix
nixosConfigurations.your-host = nixpkgs.lib.nixosSystem {
  modules = [
    ./configuration.nix
    inputs.keyboard-layout-osd.nixosModules.default
  ];
};
```

Run `sudo nixos-rebuild switch --flake .#your-host` from your system flake
directory, then log out and back in. Enable **Keyboard Layout OSD** in the
Extensions application or run:

```bash
gnome-extensions enable keyboard-layout-osd@gruvery.systems
```

### Home Manager installation

Pass the flake inputs to your Home Manager modules with
`home-manager.extraSpecialArgs = { inherit inputs; };` in your NixOS
configuration. For standalone Home Manager, set
`extraSpecialArgs = { inherit inputs; };` in the arguments to
`homeManagerConfiguration`.

Use the GNOME Shell module to install and enable the extension:

```nix
{ inputs, pkgs, ... }:
{
  programs.gnome-shell = {
    enable = true;
    extensions = [
      { package = inputs.keyboard-layout-osd.packages.${pkgs.stdenv.hostPlatform.system}.default; }
    ];
  };
}
```

Apply your configuration with `nixos-rebuild switch` for integrated Home
Manager or `home-manager switch` for standalone Home Manager, using your
usual flake target. Log out and back in so GNOME Shell picks up the extension.

## Install from source

Copy or clone the project to:

```text
~/.local/share/gnome-shell/extensions/keyboard-layout-osd@gruvery.systems/
```

Compile the settings schema and enable the extension:

```bash
cd ~/.local/share/gnome-shell/extensions/keyboard-layout-osd@gruvery.systems
glib-compile-schemas schemas
gnome-extensions enable keyboard-layout-osd@gruvery.systems
```

Open its settings from the Extensions application or with:

```bash
gnome-extensions prefs keyboard-layout-osd@gruvery.systems
```

## Development

After changing `stylesheet.css`, disable and re-enable the extension:

```bash
gnome-extensions disable keyboard-layout-osd@gruvery.systems
gnome-extensions enable keyboard-layout-osd@gruvery.systems
```

After changing `prefs.js`, close and reopen the preferences window. After
changing the schema, run `glib-compile-schemas schemas` in the extension
directory. To pick up changes to `extension.js` or a schema already loaded
by GNOME Shell, start a fresh Shell process. On Wayland, log out and back in
or use a nested session with `dbus-run-session -- gnome-shell --devkit --wayland`.

## License

Keyboard Layout OSD is licensed under the
[GNU General Public License v3.0](LICENSE).

## Project

Developed by [Gruvery.Systems](https://github.com/gruvery-systems). Source code and
issue tracking are available on
[GitHub](https://github.com/gruvery-systems/keyboard-layout-osd).
