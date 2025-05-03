# Icon Files

## Windows Icon Format
For proper Windows taskbar icon display, you should convert the project-logo.png to an .ico file.

To convert the PNG to ICO format:
1. Use an online converter like https://convertico.com/ or https://icoconvert.com/
2. Use an image editing software like GIMP or Photoshop
3. Use a command-line tool like ImageMagick with the command: `magick convert project-logo.png -define icon:auto-resize=256,128,64,48,32,16 project-logo.ico`

After creating the ICO file, place it in this directory and update the package.json build configuration to use it:

```json
"win": {
  "target": "nsis",
  "icon": "icons/project-logo.ico"
}
```

This will ensure proper icon display in the Windows taskbar and application window.