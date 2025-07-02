# My Starboard - Personal Dashboard Extension

A minimalistic Firefox and Chrome compatible extension that transforms your new tab page into a personal productivity dashboard with note-taking, to-do lists, and weather information.

## Features

### 📝 Rich Text Notepad
- **Google Doc-style editing** with full rich text support
- **Text formatting**: Bold, italic, strikethrough
- **Lists**: Bullet points and numbered lists
- **Font options**: Sans-serif, serif, and monospace
- **Hyperlinks**: Easy link insertion and editing
- **Keyboard shortcuts**: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (links)

### ✅ Smart To-Do List
- Add, complete, and delete tasks
- Visual checkbox interface
- Strikethrough completed items
- Persistent storage across sessions

### 🌤️ Weather Widget
- Location-based weather information
- Temperature, humidity, and wind speed
- Automatic refresh capability
- Clean, minimalistic display

### 🎨 Adaptive Theming
- **Auto theme detection** based on local time
- **Manual theme toggle** (light/dark modes)
- **Minimalistic design** with black/white color scheme
- **Translucent elements** with backdrop blur effects

## Installation

### Chrome Installation

1. **Download the extension files** to a local folder
2. **Convert the SVG icon** to PNG files:
   - Create `icon-16.png`, `icon-32.png`, `icon-48.png`, and `icon-128.png` from the provided `icons/icon.svg`
   - You can use online SVG to PNG converters or image editing software
3. **Open Chrome** and navigate to `chrome://extensions/`
4. **Enable Developer mode** (toggle in the top right)
5. **Click "Load unpacked"** and select the folder containing the extension files
6. **Open a new tab** to see your dashboard

### Firefox Installation

1. **Download the extension files** to a local folder
2. **Convert the SVG icon** to PNG files (same as Chrome instructions)
3. **Open Firefox** and navigate to `about:debugging#/runtime/this-firefox`
4. **Click "Load Temporary Add-on"**
5. **Select the `manifest.json` file** from your extension folder
6. **Open a new tab** to see your dashboard


## Usage Guide

### Notepad Features

1. **Basic Formatting**:
   - Select text and click format buttons (B, I, S)
   - Use keyboard shortcuts: Ctrl+B, Ctrl+I

2. **Lists**:
   - Click the bullet (•) or numbered (1.) buttons
   - Use Enter to create new list items

3. **Links**:
   - Select text and click the link button (🔗)
   - Or use Ctrl+K shortcut

4. **Font Changes**:
   - Select font from dropdown: Sans, Serif, or Mono



### To-Do List

1. **Add Task**: Click the "+" button or press Enter in input field
2. **Complete Task**: Click the checkbox next to the task
3. **Delete Task**: Hover over task and click the "×" button

### Weather Widget

- **Automatic loading** on page load
- **Manual refresh** using the refresh button (↻)
- **Location permission** required for accurate weather data

### Theme Management

- **Auto-detection**: Light mode (6 AM - 6 PM), Dark mode (6 PM - 6 AM)
- **Manual toggle**: Click the theme button in the top-right corner
- **Persistent preference**: Your choice is saved and remembered

## Data Storage

All your data is stored locally in your browser:

- **Notes**: Saved automatically as you type
- **To-do items**: Persist across browser sessions
- **Theme preference**: Remembered between sessions
- **Font selection**: Saved for future use

For Chrome users, data also syncs across devices when signed into Chrome.

## Technical Details

### Browser Compatibility
- **Chrome**: Version 88+
- **Firefox**: Version 109+
- **Edge**: Chromium-based versions

### Permissions Required
- **Storage**: For saving notes and preferences
- **Geolocation**: For weather location (optional)

### File Structure
```
my-starboard-extension/
├── manifest.json       # Extension configuration
├── mystarboard.html        # Main dashboard HTML
├── styles.css         # Styling and themes
├── script.js          # Application logic
├── icons/             # Extension icons
│   ├── icon.svg       # SVG template
│   ├── icon-16.png    # 16x16 icon
│   ├── icon-32.png    # 32x32 icon
│   ├── icon-48.png    # 48x48 icon
│   └── icon-128.png   # 128x128 icon
└── README.md          # This file
```

## Weather API Setup (Optional)

The extension includes mock weather data for demonstration. For real weather data:

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Replace the `fetchWeatherData` function in `script.js` with actual API calls
3. Update the host permissions in `manifest.json` if needed


## Troubleshooting

### Extension Not Loading
- Ensure all required icon files are present
- Check browser console for errors
- Verify manifest.json syntax

### Weather Not Working
- Allow location permissions when prompted
- Check browser console for geolocation errors
- Ensure internet connection for API calls

### Data Not Saving
- Check if browser storage is enabled
- Clear browser cache and reload extension
- Verify localStorage is not disabled

## Contributing

This extension is designed to be easily customizable. Feel free to:
- Modify the design and layout
- Add new productivity features
- Improve the weather integration
- Enhance the rich text editor

## License

This project is open source and available under the MIT License.

---

**Enjoy your new productivity-focused new tab experience!** 🚀 