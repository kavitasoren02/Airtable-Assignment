# Form Builder Frontend

A React + Vite + Tailwind CSS frontend for building dynamic forms connected to Airtable.

## Features

- **Airtable OAuth Login** - Secure authentication with Airtable
- **Form Builder UI** - Select bases, tables, and fields to create forms
- **Form Viewer** - Fill and submit forms with real-time conditional logic
- **Response Listing** - View all form submissions
- **Responsive Design** - Clean UI with Tailwind CSS

## Tech Stack

- React 18
- Vite
- Axios
- Tailwind CSS v4
- React Router

## Setup

### 1. Prerequisites
- Node.js (v14+)
- Backend server running on `http://localhost:5000`

### 2. Installation

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a `.env` file in the root directory:

\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

### 4. Running the Development Server

\`\`\`bash
npm run dev
\`\`\`

Frontend will run on `http://localhost:5173`

### 5. Building for Production

\`\`\`bash
npm run build
\`\`\`

## Project Structure

\`\`\`
Frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx           # Airtable OAuth login
│   │   ├── AuthCallbackPage.jsx    # OAuth callback handler
│   │   ├── DashboardPage.jsx       # List all forms
│   │   ├── FormBuilderPage.jsx     # Create/edit forms
│   │   ├── FormViewerPage.jsx      # Fill and submit forms
│   │   └── ResponsesPage.jsx       # View form submissions
│   ├── utils/
│   │   ├── auth.js                 # JWT token management
│   │   └── conditionalLogic.js     # Form visibility logic
│   ├── config/
│   │   └── api.js                  # API configuration
│   ├── App.jsx                     # Main router
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Tailwind styles
├── .env                            # Environment variables
├── package.json
├── vite.config.js
└── README.md
\`\`\`

## Key Pages

### 1. LoginPage
- Redirects to Airtable OAuth
- Simple, clean login UI

### 2. AuthCallbackPage
- Receives OAuth callback
- Exchanges code for JWT token
- Redirects to dashboard

### 3. DashboardPage
- Lists all user's forms
- Create new form button
- Edit and view responses options

### 4. FormBuilderPage
- Select Airtable base and table
- Choose fields to include in form
- Configure question labels and requirements
- Save form definition

### 5. FormViewerPage
- Display form fields based on configuration
- Real-time conditional logic evaluation
- Validate required fields
- Submit form responses

### 6. ResponsesPage
- List all form submissions
- Display answer data
- Show submission timestamps

## Styling

Uses Tailwind CSS v4 with custom utility classes:

- `.btn` - Button base styles
- `.btn-primary` - Primary button (blue)
- `.btn-secondary` - Secondary button (gray)
- `.card` - White card with shadow
- `.input` - Form input styling
- `.label` - Form label styling
- `.form-group` - Form field wrapper
- `.error` - Error message styling
- `.success` - Success message styling

No custom CSS classes are used directly in components - only Tailwind utilities and defined utilities in `index.css`.

## API Integration

Frontend communicates with backend using Axios:

\`\`\`javascript
import axios from 'axios'
import { getAuthHeader } from './utils/auth'

const response = await axios.get('/api/endpoint', {
  headers: getAuthHeader()
})
\`\`\`

All requests include JWT token in Authorization header.

## Future Enhancements

- Form preview mode
- Conditional logic builder UI
- Response export (CSV/JSON)
- Form analytics
- Webhook status monitoring
- Advanced form validation UI


# Form Builder Backend

A Node.js + Express + MongoDB backend for building dynamic forms connected to Airtable.

## Features

- **Airtable OAuth Integration** - Secure login with Airtable
- **Form Builder API** - Create forms from Airtable bases and tables
- **Conditional Logic** - Show/hide form fields based on answers
- **Form Submissions** - Save responses to both MongoDB and Airtable
- **Webhook Sync** - Keep database in sync with Airtable changes
- **Field Validation** - Support for text, select, and attachment fields

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Axios (HTTP client)
- JWT (Authentication)

## Setup

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Airtable account with OAuth app

### 2. Installation

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a `.env` file in the root directory:

\`\`\`env
AIRTABLE_CLIENT_ID=your_client_id
AIRTABLE_CLIENT_SECRET=your_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:5173/auth/callback
AIRTABLE_SCOPES=user.email:read,schema.bases:read,data.records:read,data.records:write

MONGODB_URI=mongodb://localhost:27017/form-builder

JWT_SECRET=your-super-secret-jwt-key

PORT=5000
FRONTEND_URL=http://localhost:5173
\`\`\`

### 4. Running the Server

Development:
\`\`\`bash
npm run dev
\`\`\`

Production:
\`\`\`bash
npm start
\`\`\`

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `GET /api/auth/oauth-url` - Get Airtable OAuth URL
- `POST /api/auth/callback` - Exchange code for token
- `GET /api/auth/me` - Get current user info

### Forms
- `GET /api/forms/airtable/bases` - Get user's Airtable bases
- `GET /api/forms/airtable/bases/:baseId/tables` - Get tables in a base
- `GET /api/forms/airtable/bases/:baseId/tables/:tableId/fields` - Get fields in a table
- `POST /api/forms` - Create new form
- `GET /api/forms` - Get all user forms
- `GET /api/forms/:formId` - Get single form

### Responses
- `POST /api/responses/:formId/submit` - Submit form response
- `GET /api/responses/:formId` - Get all responses for a form

### Webhooks
- `POST /api/webhooks/airtable` - Airtable webhook endpoint

## Project Structure

\`\`\`
Backend/
├── server.js                 # Entry point
├── middleware/
│   └── auth.js              # JWT authentication
├── models/
│   ├── User.js              # User schema
│   ├── Form.js              # Form schema
│   └── Response.js          # Response schema
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── forms.js             # Form endpoints
│   ├── responses.js         # Response endpoints
│   └── webhooks.js          # Webhook endpoints
├── utils/
│   └── conditionalLogic.js  # Form conditional logic
├── .env                      # Environment variables
├── package.json
└── README.md
\`\`\`

## Airtable Setup

### Create OAuth App
1. Go to Airtable.com
2. Create a new OAuth application
3. Set redirect URI to: `http://localhost:5173/auth/callback`
4. Copy Client ID and Client Secret to `.env`

### Supported Field Types
- Single line text
- Multi-line text
- Single select
- Multiple select
- Attachments

## Key Functions

### shouldShowQuestion()
Located in `utils/conditionalLogic.js`, this pure function evaluates conditional visibility rules.

\`\`\`javascript
shouldShowQuestion(rules, answersSoFar) -> boolean
\`\`\`

Rules format:
\`\`\`javascript
{
  logic: "AND" | "OR",
  conditions: [
    {
      questionKey: "string",
      operator: "equals" | "notEquals" | "contains",
      value: any
    }
  ]
}
\`\`\`

## Error Handling

All endpoints return structured error responses:

\`\`\`json
{
  "error": "Error message describing what went wrong"
}
\`\`\`

## Future Enhancements

- Token refresh logic
- Form versioning
- Response export (CSV/JSON)
- Advanced field types
- Form analytics
