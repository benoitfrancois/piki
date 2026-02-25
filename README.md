# 📚 Piki — Your Personal Wiki

Piki is a personal, offline, and secure wiki application. It runs locally on your machine and is accessible via your browser at `localhost:8080`. No cloud, no account, no tracking — your notes stay on your computer.

---

## ✨ Features

- **Pages** — Create, edit, and delete pages with rich text content
- **Types** — Categorize pages with colored types and custom icons
- **Tags** — Tag your pages for easy filtering and organization
- **Search** — Find pages instantly by title
- **Dashboard** — Overview of your wiki
- **Import / Export** — Backup and restore your data as a ZIP file
- **Print** — Print any page directly from the browser
- **Security** — Password-protected access with encrypted storage

---

## 🚀 Getting Started

### Requirements

- Java 17 or higher installed on your machine
- A modern browser (Chrome, Firefox, Edge, Safari)

### Installation

1. Download the latest release and extract it to a folder of your choice
2. The folder should contain:
   ```
   piki/
   ├── piki.jar
   ├── application.properties
   ├── start.bat              (Windows)
   └── start.command          (Mac)
   ```

### First Launch

**Windows:**
```
Double-click start.bat
```

**Mac:**
```
Double-click start.command
```
> The first time you run start.command on Mac, you may need to make it executable:
> `chmod +x start.command`

The browser will open automatically after a few seconds at `http://localhost:8080`.

---

## 🔐 Security Setup

On first launch, you will be prompted to create a password. This password protects access to your wiki.

After setting your password, a **recovery key** will be generated (format: `PIKI-XXXX-XXXX-XXXX-XXXX`).

> ⚠️ **Save your recovery key in a safe place. It will never be shown again.**

If you forget your password, you can reset it using your recovery key via the "Forgot password?" link on the login page.

---

## ⚙️ Configuration

The `application.properties` file next to the JAR contains the configurable settings:

| Property | Description | Default |
|---|---|---|
| `server.servlet.session.timeout` | Session timeout before auto-logout | `60m` |
| `piki.security.password` | Encrypted app password (set by setup) | `CHANGE_ME` |
| `piki.security.recovery-key` | Encrypted recovery key (set by setup) | `CHANGE_ME` |
| `spring.datasource.password` | Encrypted database password (set by setup) | `CHANGE_ME` |

> Do not edit `piki.security.*` and `spring.datasource.password` manually — they are managed by Piki.

---

## 💾 Data

All your data is stored locally in the `data/` folder next to the JAR:

```
piki/
├── data/
│   ├── h2-db/          ← Database files
│   └── .configured     ← Setup marker
```

> To reset Piki completely (e.g. for a fresh start), delete the `data/` folder and reset `application.properties` to its default values.

---

## 🔄 Backup & Restore

Use the **Import / Export** feature in the app to:
- **Export** — Download a ZIP file containing all your pages, types, and tags
- **Import** — Restore your data from a ZIP file (types are created automatically if missing)

---

## 🛠️ Built With

- [Spring Boot 3.5](https://spring.io/projects/spring-boot) — Backend
- [H2 Database](https://www.h2database.com) — Embedded database
- [Angular 18](https://angular.io) — Frontend
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Jasypt](http://www.jasypt.org) — Password encryption

---

## 📄 License

Piki is free to use for personal use.

---

## 💬 Support & Donations

If you enjoy using Piki, consider supporting the project at [getpiki.app](https://getpiki.app).
