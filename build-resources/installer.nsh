; A3-Elite custom NSIS installer additions
; This file is included by electron-builder automatically

; Add a custom finish page message
!macro customInstall
  ; Create registry entry for app
  WriteRegStr HKCU "Software\A3EN\A3-Elite" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\A3EN\A3-Elite" "Version" "2.0.0"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\A3EN\A3-Elite"
!macroend
