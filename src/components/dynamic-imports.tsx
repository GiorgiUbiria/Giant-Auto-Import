import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Loading component for dynamic imports
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
);

// Form Section Components - Optimized with lazy loading
export const DynamicBasicInfoSection = dynamic(
  () => import('./shared-form-sections/basic-info-section').then(mod => ({ default: mod.BasicInfoSection })),
  {
    loading: LoadingSpinner,
    ssr: true,
  }
);

export const DynamicAuctionInfoSection = dynamic(
  () => import('./shared-form-sections/auction-info-section').then(mod => ({ default: mod.AuctionInfoSection })),
  {
    loading: LoadingSpinner,
    ssr: true,
  }
);

export const DynamicFinancialInfoSection = dynamic(
  () => import('./shared-form-sections/financial-info-section').then(mod => ({ default: mod.FinancialInfoSection })),
  {
    loading: LoadingSpinner,
    ssr: true,
  }
);

export const DynamicImageUploadSection = dynamic(
  () => import('./add-car-form/image-upload-section').then(mod => ({ default: mod.ImageUploadSection })),
  {
    loading: LoadingSpinner,
    ssr: false, // File upload components should be client-side
  }
);

// Heavy UI Components - Dynamic imports
export const DynamicDataTable = dynamic(
  () => import('./data-table').then(mod => ({ default: mod.DataTable })),
  {
    loading: LoadingSpinner,
    ssr: true,
  }
);

export const DynamicShippingCalculator = dynamic(
  () => import('../app/calculator/shipping-calculator').then(mod => ({ default: mod.ShippingCalculator })),
  {
    loading: LoadingSpinner,
    ssr: false, // This component has heavy calculations, better to load client-side
  }
);

// Heavy Image Gallery Components
export const DynamicFallbackImageGallery = dynamic(
  () => import('../app/car/[vin]/fallback-image-gallery').then(mod => ({ default: mod.FallbackImageGallery })),
  {
    loading: LoadingSpinner,
    ssr: false, // Image galleries are heavy, load client-side
  }
);

export const DynamicImageGallery = dynamic(
  () => import('../app/car/[vin]/image-gallery').then(mod => ({ default: mod.ImageGallery })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);



// Virtualized Grid Component - Heavy virtualization
export const DynamicVirtualizedGrid = dynamic(
  () => import('../app/car/[vin]/virtualized-grid').then(mod => ({ default: mod.default })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// React Window Components - Heavy virtualization
export const DynamicFixedSizeGrid = dynamic(
  () => import('react-window').then(mod => ({ default: mod.FixedSizeGrid })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// React Photo Album - Heavy image handling
export const DynamicPhotoAlbum = dynamic(
  () => import('react-photo-album').then(mod => ({ default: mod.default })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// Form Components - Heavy validation
export const DynamicRegisterForm = dynamic(
  () => import('./register-form'),
  {
    loading: LoadingSpinner,
    ssr: true,
  }
);

export const DynamicLoginForm = dynamic(
  () => import('./login-form'),
  {
    loading: LoadingSpinner,
    ssr: true,
  }
);

// Admin Components - Heavy data tables
export const DynamicAdminCarsClient = dynamic(
  () => import('../app/admin/cars/client').then(mod => ({ default: mod.Client })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

export const DynamicAdminUsersClient = dynamic(
  () => import('../app/admin/users/client').then(mod => ({ default: mod.Client })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// Dashboard Components
export const DynamicDashboardClient = dynamic(
  () => import('../app/dashboard/client').then(mod => ({ default: mod.Client })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// Car Detail Components
export const DynamicCarClientView = dynamic(
  () => import('../app/car/[vin]/CarClientView').then(mod => ({ default: mod.default })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// Edit Car Form - Heavy form with image management
export const DynamicEditCarForm = dynamic(
  () => import('./edit-car-form').then(mod => ({ default: mod.EditCarForm })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
); 