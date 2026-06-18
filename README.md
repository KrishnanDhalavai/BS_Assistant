# Brawl Stars Draft Assistant

An interactive, high-fidelity drafting dashboard designed for competitive Brawl Stars drafting. It features a fully deterministic matching engine that calculates the top 5 brawler counters against opponent picks, taking team synergy weights, bans, and active draft states into account.

The UI is built with an esports-authentic theme featuring custom brand typography, dynamic cursor followers, ambient background music loop toggles, and smooth background video cross-fading.

---

## 🚀 Key Features

*   **Deterministic Matchup Engine**: Custom scoring logic (`FinalScore = CounterScore + SynergyScore`) to suggest the mathematically best counter-picks, tie-broken alphabetically.
*   **Database Seeding**: Seeder script parses raw brawler datasets, cleans Markdown fences, and imports brawlers, counters, and meta synergies into MySQL.
*   **Dynamic Theme Switcher**: A top-right button toggles between Like and Dislike themes, seamlessly cross-fading the background loop between `BackgroundBlue.mp4` and `BackgroundRed.mp4` with zero layout delay.
*   **Ambient Music Controls**: Loop background music (`brawl_ingame_07.ogg`) with interactive play/mute controls in the top-right header.
*   **Ranked Masters 3D Logo**: Centered Ranked Masters badge featuring an interactive GSAP-powered 3D perspective warp mouse-hover tilt animation.
*   **Game-Authentic Assets**: Set signature Nougat Extra Black font as default UI typography and custom Brawl Stars icon as favicon and custom active cursor follower.
*   **Automated Tests**: Unit test suite using Jest to mock database pools and isolate logic validations.

---
## ⚙️ Project Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+)
- **MySQL Server** running locally on port `3306`

### 3. Install Dependencies
Run the install command in both directories:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Database Seeding
With your MySQL server running, initialize and seed the database with the draft dataset:
```bash
cd backend
npm run seed
```
This automatically creates the `brawlstars_draft` database and populates the `brawlers`, `counters`, and `synergies` relational tables.

---

## 🏃 Running the Application

To run the application locally, start both the backend API and the frontend development server:

### Start Backend API Server
```bash
cd backend
npm start
```
*The backend runs on [http://localhost:5000](http://localhost:5000)*

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
*The frontend runs on [http://localhost:5173](http://localhost:5173)*

Open [http://localhost:5173](http://localhost:5173) in your web browser to access the dashboard.

---

## 🧪 Running Unit Tests

The backend includes isolated unit tests for the recommendation engine DTO validations and weighting scores:
```bash
cd backend
npm run test
```

---

## 📂 Project Structure

```text
├── backend/
│   ├── config/             # Database connection pool settings
│   ├── controllers/        # Request handling and validations
│   ├── repositories/       # Promise-based SQL query scripts
│   ├── routes/             # Express routes configuration
│   ├── scripts/            # Database initialization/seeder scripts
│   ├── services/           # Recommendation math weights calculation
│   ├── tests/              # Jest test cases
│   ├── .env                # Local environment secrets (ignored by Git)
│   └── server.js           # Server entry point
├── frontend/
│   ├── public/             # Static game images, cursor, and video loops
│   ├── src/
│   │   ├── components/     # Custom Dropdowns & Draft Panels
│   │   ├── App.jsx         # Main dashboard container & animations
│   │   ├── index.css       # Core typography, animations, & glass styling
│   │   └── main.jsx        # App mounting configuration
│   └── vite.config.js      # Vite proxy setup
└── README.md
```
