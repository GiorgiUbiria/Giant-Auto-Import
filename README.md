# Giant Auto Import

Giant Auto Import is a web application for an auto importing company, providing services to help customers purchase and import vehicles.

## Features

- User authentication and role-based authorization
- Vehicle browsing and search
- Shipping calculator
- Admin panel for managing users and vehicles
- Multi-language support (English, Georgian, Russian)
- Image handling and ZIP download
- Contact form

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Drizzle ORM
- SQLite database
- Lucia for authentication
- AWS S3 for image storage
- React Email for email sending
- Zod for schema validation

## Getting Started

### Prerequisites

- Node.js 16.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/giant-auto-import.git
   ```

2. Install dependencies:
   ```
   cd giant-auto-import
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
   ```
   NEXT_PUBLIC_BUCKET_URL=your_s3_bucket_url
   DATABASE_URL=your_database_url
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app`: Next.js app router and page components
- `src/components`: Reusable React components
- `src/lib`: Utility functions, database setup, and server actions
- `src/messages`: Internationalization JSON files
- `public`: Static assets

## Key Components

- `AuthActions`: Handles user authentication (login, register, logout)
- `DownloadButton`: Allows users to download vehicle images as a ZIP file
- `ShippingCalculator`: Calculates shipping costs for vehicles
- `LocaleSwitcher`: Enables language switching

## Deployment

This project is set up for deployment on Vercel. Connect your GitHub repository to Vercel for automatic deployments.

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries, please contact us at info@giantautoimport.com.
