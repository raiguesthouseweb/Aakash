# Rai Guest House Management System

A full-featured guest house management system for Rai Guest House with food ordering, tourism information, and admin features.

## Features

### Guest-Facing Features:
- **Menu & Ordering System**: Allow guests to browse menu items and place food orders directly from their rooms
- **Order Status Tracking**: Real-time updates on order preparation and delivery status
- **Tourism Information**: Detailed information about local attractions, with photos and Google Maps integration
- **Multi-language Support**: Interface localization for multiple languages
- **Dark/Light Mode**: Customizable display preferences

### Admin Features:
- **Order Management**: Track, update, and manage incoming food orders
- **Menu Management**: Add, edit, or disable menu items
- **Tourism Information Management**: Maintain tourism attraction details
- **Financial Tracking**: Track revenue, settlements, and restaurant payments
- **User Management**: Create and manage admin accounts
- **PWA Support**: Install as a mobile app with push notifications

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js with TypeScript
- **Storage**: In-memory storage with option to integrate persistent database
- **Real-time Communication**: WebSockets for instant notifications
- **Styling**: Tailwind CSS with Shadcn UI components
- **PWA**: Progressive Web App capabilities for admin dashboard

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/rai-guest-house.git
   cd rai-guest-house
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser to `http://localhost:5000`

### Default Login Credentials

- **Username**: admin
- **Password**: superman123

## Project Structure

```
rai-guest-house/
├── client/                 # Main web application
│   ├── src/                # Source files
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── types.ts        # TypeScript type definitions
│   └── ...
├── pwa-admin/              # Progressive Web App for admins
│   ├── public/             # Static files and service worker
│   └── src/                # Source code for PWA
├── server/                 # Backend Express server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage implementation
│   └── vite.ts             # Vite configuration for server
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Data schemas and types
└── ...
```

## PWA Installation

The admin interface can be installed as a Progressive Web App:

1. Navigate to the admin interface in Chrome or other modern browser
2. Log in with admin credentials
3. Look for the "Install" option in the browser's menu or an install prompt
4. The app will be installed on your device with offline capabilities
5. Enable notifications when prompted for real-time order alerts

## Customization

### Menu Categories

You can customize menu categories in `client/src/config/constants.ts`:

```typescript
export const MENU_CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Beverages"
];
```

### Tourism Tags

Customize tourism tags in the same file:

```typescript
export const TOURISM_TAGS = [
  "Historical",
  "Religious",
  "Nature",
  "Shopping",
  "Entertainment"
];
```

### Styling and Theming

The application uses a customizable theme in `theme.json`:

```json
{
  "primary": "#4f46e5",
  "variant": "vibrant",
  "appearance": "light",
  "radius": 0.5
}
```

## Deployment

The application can be deployed to any hosting service that supports Node.js:

1. Build the application:
   ```
   npm run build
   ```

2. Deploy the `/dist` directory to your hosting provider

## License

This project is released under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, Express, and TypeScript
- UI components from Shadcn UI
- Icons from Lucide React