
[Setup]
AppName=JOSHFIRE_APP_NAME
AppVersion=JOSHFIRE_VERSION_MAJOR.JOSHFIRE_VERSION_MINOR.JOSHFIRE_VERSION_PATCH
DefaultDirName={pf}\JOSHFIRE_APP_NAME
DefaultGroupName=JOSHFIRE_APP_NAME
Uninstallable=yes
UninstallDisplayIcon={app}\JOSHFIRE_APP_NAME.exe
OutputDir=.
OutputBaseFilename=JOSHFIRE_APP_NAMESetup


[Icons]
Name: "{group}\JOSHFIRE_APP_NAME"; Filename: "{app}\JOSHFIRE_APP_NAME.exe"
Name: "{userdesktop}\JOSHFIRE_APP_NAME"; Filename: "{app}\JOSHFIRE_APP_NAME.exe"; Tasks: desktopicon


[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"


[Run]
; NOTE: The following entry contains an English phrase ("Launch"). You are free to translate it into another language if required.
Filename: "{app}\JOSHFIRE_APP_NAME.exe"; Description: "Launch My Program"; Flags: nowait postinstall skipifsilent


[Files]
Source: "JOSHFIRE_APP_NAME.exe"; DestDir: "{app}"
