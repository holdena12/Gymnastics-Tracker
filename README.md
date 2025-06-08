# Gymnastics Skills Tracker

A comprehensive men's gymnastics skills tracking application built with Tauri, featuring cross-platform support for desktop and mobile (iOS).

## Features

### 🏆 Complete Men's Gymnastics Events
- **Floor Exercise** - Track tumbling passes and dance elements
- **Pommel Horse** - Monitor circle work and dismount skills
- **Still Rings** - Record strength moves and combinations
- **Vault** - Catalog different vault families and techniques
- **Parallel Bars** - Track swing elements and releases
- **High Bar** - Monitor giant swings, releases, and dismounts

### 📊 Advanced Tracking
- **Skill Difficulty Rating** - A through I scale (0.1-0.9 values)
- **Start Value Calculation** - Automatic calculation based on skills (Base 12.0 + skill difficulties)
- **Progress Visualization** - Visual progress bars for each event
- **Completion Tracking** - Check off mastered skills
- **Target Dates** - Set and track skill acquisition goals

### 🎯 Learning Progressions
- **Step-by-Step Progressions** - Break down complex skills into manageable steps
- **Progress Tracking** - Monitor advancement through each progression step
- **Skill Development** - Build foundation before attempting advanced elements

### 🔧 Organization Features
- **Drag-and-Drop Reordering** - Organize skills in preferred order
- **Click-to-Position** - Precise skill positioning with numbered ordering
- **Routine Management** - Create and manage multiple routines per event
- **Data Persistence** - All progress automatically saved locally

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Rust with Tauri framework
- **Mobile**: iOS support via Tauri mobile
- **Storage**: Local storage with automatic persistence
- **UI**: Modern responsive design with smooth animations

## Installation

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (v16+)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gymnastics-skills-tracker.git
   cd gymnastics-skills-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

### Building for Production

#### Desktop
```bash
npm run tauri build
```

#### iOS (requires macOS with Xcode)
```bash
# Initialize iOS development
npm run tauri ios init

# Run on iOS Simulator
npm run tauri ios dev

# Build for iOS
npm run tauri ios build
```

## Usage

1. **Select Event** - Choose from the six men's gymnastics events
2. **Create Routine** - Add a new routine with target date
3. **Add Skills** - Include skills with appropriate difficulty ratings
4. **Track Progress** - Check off completed skills and monitor progress
5. **Use Progressions** - Break down difficult skills into learning steps
6. **Organize** - Drag and drop skills to reorder as needed

## Project Structure

```
gymnastics-tracker/
├── src/                    # Frontend code
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styling and animations
│   └── main.js            # Core JavaScript functionality
├── src-tauri/             # Rust backend
│   ├── src/               # Rust source code
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/) framework
- Designed for competitive gymnasts and coaches
- Supports FIG Code of Points skill difficulty standards

## Screenshots

*Screenshots and demo GIFs to be added*

---

**Happy Training! 🤸‍♂️**
