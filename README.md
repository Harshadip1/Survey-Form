# SurveyForge — Survey Form Builder & Analytics Platform

A modern, premium survey form builder and analytics platform built with **HTML5**, **CSS3**, and **Vanilla JavaScript**. Create beautiful surveys, collect responses, and analyze data — all in your browser.

![Platform](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## Features

### Survey Builder
- **Drag & drop** question palette with 11+ question types
- Add, remove, duplicate, and reorder questions
- Required field toggles and conditional logic UI
- Multi-page / multi-step survey support
- Live editing with auto-save drafts
- AI survey suggestion UI
- Voice input UI (frontend demo)

### Question Types
| Type | Description |
|------|-------------|
| Short Text | Single-line text input |
| Long Text | Multi-line textarea |
| Multiple Choice | Radio button options |
| Checkboxes | Multi-select options |
| Dropdown | Select menu |
| Rating Scale | Star rating (1–5) |
| Date Picker | Date input |
| File Upload | File attachment UI |
| Email | Email with validation |
| Number | Numeric input |
| Password | Password with strength meter |

### Analytics Dashboard
- Pie, bar, line, and circular charts (Canvas)
- Response trends and completion rates
- Question performance metrics
- Demographics and engagement heatmap
- Animated counters and progress rings

### Additional Features
- Form validation (required, email, number, password strength)
- Theme customization (5 themes + color/font/layout)
- Response management with search & filter
- Export UI (PDF, CSV, JSON, Excel simulation)
- Share survey (link, QR code, embed, social)
- Team collaboration UI (frontend)
- Toast notifications system
- Dark/light mode toggle
- Offline mode banner
- Accessibility mode (high contrast, large text, reduced motion)
- Multi-language selector UI
- Survey archive system
- Completion certificates
- Fully responsive (mobile, tablet, desktop)

---

## Technologies Used

- **HTML5** — Semantic markup, drag & drop API, form elements
- **CSS3** — CSS Variables, Flexbox, Grid, animations, glassmorphism
- **Vanilla JavaScript** — Modular architecture, LocalStorage, Canvas charts, Intersection Observer

No frameworks or build tools required.

---

## How to Run in VS Code

### Step 1: Install Visual Studio Code
Download and install [Visual Studio Code](https://code.visualstudio.com/) if you don't have it.

### Step 2: Open the Project Folder
1. Launch VS Code
2. Go to **File → Open Folder**
3. Select the `Survey Form` project folder

### Step 3: Install Live Server Extension
1. Click the **Extensions** icon in the sidebar (or press `Ctrl+Shift+X`)
2. Search for **Live Server**
3. Install the extension by **Ritwick Dey**

### Step 4: Launch the Application
1. Right-click on `index.html` in the Explorer panel
2. Click **"Open with Live Server"**
3. Your browser will open at `http://127.0.0.1:5500` (or similar port)

### Alternative: Open Directly
You can also double-click `index.html` to open in a browser, but **Live Server is recommended** for proper routing and hot reload.

---

## Folder Structure

```
Survey Form/
├── index.html              # Landing page
├── dashboard.html          # Admin dashboard
├── builder.html            # Drag & drop survey builder
├── preview.html            # Form preview
├── survey.html             # Live survey (respondent view)
├── analytics.html          # Analytics dashboard
├── responses.html          # Response management
├── templates.html          # Templates gallery
├── themes.html             # Theme customization
├── settings.html           # App settings
├── profile.html            # User profile
├── export.html             # Export reports
├── share.html              # Share survey
├── results.html            # Survey results
├── question-bank.html      # Reusable questions
├── team.html               # Team collaboration
├── notifications.html      # Notifications center
├── about.html              # About platform
├── contact.html            # Contact form
├── css/
│   ├── style.css           # Core styles & design system
│   ├── builder.css         # Builder-specific styles
│   ├── dashboard.css       # Dashboard & charts
│   ├── themes.css          # Theme variations
│   └── responsive.css      # Media queries & responsive
├── js/
│   ├── app.js              # Core app, storage, UI utilities
│   ├── builder.js          # Survey builder logic
│   ├── dragdrop.js         # Drag & drop handling
│   ├── validation.js       # Form validation system
│   ├── analytics.js        # Charts & analytics
│   ├── responses.js        # Response management
│   ├── themes.js           # Theme customization
│   └── export.js           # Export, share & live survey
├── assets/
│   ├── images/             # Image assets
│   └── templates/          # Template assets
└── README.md
```

---

## Usage Guide

### Creating a Survey
1. Open `builder.html` or click **Create Survey** from the dashboard
2. Enter a title and description
3. Click question types in the left panel or drag them to the canvas
4. Click a question to edit properties in the right panel
5. Add pages for multi-step surveys using **+ Add Page**
6. Click **Save Survey** to persist to LocalStorage
7. Click **Preview** to see the form before publishing

### Taking a Survey
1. Open `survey.html` or use a share link (`survey.html?id=demo1`)
2. Complete each step and click **Next**
3. Validation runs automatically on required fields
4. Progress auto-saves every 10 seconds
5. Submit to store the response locally

### Viewing Analytics
1. Open `analytics.html` from the sidebar
2. View charts for response trends, satisfaction, and question performance
3. Check demographics and heatmap data

### Managing Responses
1. Open `responses.html`
2. Search, filter by survey, or select multiple rows
3. Click **View** to open the detail modal
4. Export via `export.html`

### Customizing Themes
1. Open `themes.html`
2. Select a preset theme (Minimal, Neon, Glass, Professional, Gradient)
3. Customize colors, fonts, and layout
4. Changes apply to the live survey view

### Sharing a Survey
1. Open `share.html`
2. Copy the survey link or QR code
3. Use embed code for websites
4. Send email invites (UI demo)

---

## Key Systems

### Drag & Drop Builder
The builder uses the HTML5 Drag and Drop API. Question types are draggable from the sidebar palette. Questions on the canvas can be reordered by dragging. See `js/dragdrop.js` and `js/builder.js`.

### Validation System
Real-time and on-submit validation supports required fields, email format, numbers, and password strength. Error messages animate in with shake effects. See `js/validation.js`.

### Analytics Dashboard
Charts are rendered with the Canvas API — pie, bar, line charts, plus animated progress rings and horizontal bar metrics. See `js/analytics.js`.

### Theme Customization
Five preset themes with CSS class switching, custom color pickers, font selection, and layout options. Settings persist via LocalStorage. See `js/themes.js`.

### Data Persistence
All surveys, responses, settings, and notifications are stored in `localStorage` under prefixed keys (`sf_*`). Demo data is seeded on first load.

---

## Browser Compatibility

| Browser | Supported |
|---------|-----------|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |

Requires JavaScript enabled. LocalStorage required for data persistence.

---

## Performance Optimization

- Efficient DOM updates (targeted re-renders in builder)
- CSS `transform` and `opacity` for smooth animations
- Intersection Observer for scroll-reveal (no scroll listeners)
- Canvas charts instead of heavy chart libraries
- Debounced search filtering
- Reduced motion support disables animations
- Particle canvas uses requestAnimationFrame

---

## Troubleshooting

### Live Server not opening
- Ensure the Live Server extension is installed and enabled
- Check that port 5500 is not blocked by firewall
- Try clicking "Go Live" in the VS Code status bar

### Charts not displaying
- Open the page via Live Server (not `file://` protocol)
- Check browser console for JavaScript errors
- Ensure `js/analytics.js` is loaded after `js/app.js`

### Data not saving
- Verify LocalStorage is enabled in browser settings
- Clear site data and reload to reset demo data
- Use a supported browser (see compatibility table)

### Drag & drop not working
- Use a modern browser with Drag and Drop API support
- On mobile, use tap-to-add question types instead of drag

### Styles look broken
- Confirm all CSS files are in the `css/` folder
- Hard refresh with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| Home | `index.html` | Landing page with hero, features, templates |
| Dashboard | `dashboard.html` | Stats, charts, recent activity |
| Builder | `builder.html` | Drag & drop survey creator |
| Preview | `preview.html` | Survey preview mode |
| Live Survey | `survey.html` | Respondent survey interface |
| Analytics | `analytics.html` | Charts and performance metrics |
| Responses | `responses.html` | Response table and details |
| Templates | `templates.html` | Template gallery with filters |
| Themes | `themes.html` | Visual customization |
| Settings | `settings.html` | App preferences |
| Profile | `profile.html` | User profile & security |
| Export | `export.html` | Download reports |
| Share | `share.html` | Distribution options |
| Results | `results.html` | Final survey results |
| Question Bank | `question-bank.html` | Reusable questions |
| Team | `team.html` | Collaboration UI |
| Notifications | `notifications.html` | Alert center |
| About | `about.html` | Platform information |
| Contact | `contact.html` | Contact form |

---

## License

This project is open source and available for educational and portfolio use.

---

**SurveyForge** — Build surveys. Collect insights. Make decisions.
