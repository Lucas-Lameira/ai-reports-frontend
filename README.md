# AI Reports Frontend

Frontend application for generating therapeutic reports based on session notes.  
The interface allows therapists to input notes for multiple patients, generate AI-assisted reports, review them, and export the results as a PDF.

Ths frontend expects an API that returns reports in **Markdown format**.
The application converts the Markdown into readable text and formatted content for display and export.

---

## Features

- Add multiple patients and write session notes
- Customize the prompt used to generate reports
- Generate reports for multiple patients at once
- Copy individual reports to clipboard
- Export all reports as a single PDF

---

## Tech Stack

- **Vue 3**
- **TypeScript**
- **Vuetify**
- **Axios**
- **Vite**
- **Marked** (Markdown rendering)
- **jsPDF** (PDF generation)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Lucas-Lameira/ai-reports-frontend.git
cd ai-reports-frontend
````

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root of the project.

Example:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For production you can create `.env.production`:

```env
VITE_API_URL=https://your-backend-url/api/v1
```

---

## Build

To build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Workflow

1. Add patient names.
2. Write session notes for each patient.
3. Optionally customize the report generation prompt.
4. Generate reports.
5. Review generated reports.
6. Copy individual reports or export all reports as a PDF.

---

## PDF Export

The application allows exporting all generated reports into a single PDF file.

The file name automatically includes the generation date to prevent overwriting previous exports.

Example:

```

reports\_2026-03-07\_14-35.pdf

```