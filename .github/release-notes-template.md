{{TAG}} – ProjectHub installers

Highlights
- Cross-platform installers for the ProjectHub desktop app.
- Packs-first setup: install packs via Settings → Packs tab (stored under ~/.projecthub/packs).

Assets
- macOS: ProjectHub-macos-{{TAG}}.zip (contains DMG)
- Windows: ProjectHub-windows-{{TAG}}.zip (contains Setup.exe)
- Linux: ProjectHub-linux-{{TAG}}.zip (contains AppImage)

Install
- Download the zip for your OS from Assets below.
- macOS: unzip → open the DMG → drag ProjectHub to Applications.
- Windows: unzip → run the Setup.exe (portable exe is excluded); installer handles elevation internally.
- Linux: unzip → chmod +x the AppImage → run it (or integrate with your launcher).

Notes
- Settings live at ~/.projecthub/settings.local.json; packs at ~/.projecthub/packs.
- Release assets exclude helper binaries (e.g., elevate.exe) to reduce clutter.
