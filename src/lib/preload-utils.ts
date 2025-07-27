/**
 * Preload utilities for optimizing form loading performance
 */

// Preload critical form dependencies
export const preloadFormDependencies = () => {
  // Preload form validation libraries
  const preloadZod = () => import('zod');
  const preloadReactHookForm = () => import('react-hook-form');
  const preloadZodResolver = () => import('@hookform/resolvers/zod');
  
  // Preload UI components
  const preloadUIComponents = () => import('@/components/ui/form');
  const preloadButton = () => import('@/components/ui/button');
  
  // Preload form sections
  const preloadBasicInfo = () => import('@/components/shared-form-sections/basic-info-section');
  const preloadAuctionInfo = () => import('@/components/shared-form-sections/auction-info-section');
  const preloadFinancialInfo = () => import('@/components/shared-form-sections/financial-info-section');
  
  // Execute preloads in parallel
  Promise.all([
    preloadZod(),
    preloadReactHookForm(),
    preloadZodResolver(),
    preloadUIComponents(),
    preloadButton(),
    preloadBasicInfo(),
    preloadAuctionInfo(),
    preloadFinancialInfo(),
  ]).catch(console.error);
};

// Preload calculator utilities for auction data
export const preloadCalculatorUtils = () => {
  return import('@/lib/calculator-utils').catch(console.error);
};

// Preload user actions for financial section
export const preloadUserActions = () => {
  return import('@/lib/actions/userActions').catch(console.error);
};

// Preload all form resources
export const preloadAllFormResources = () => {
  preloadFormDependencies();
  preloadCalculatorUtils();
  preloadUserActions();
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Preload on hover for better UX
export const preloadOnHover = (preloadFn: () => void) => {
  let hasPreloaded = false;
  
  return () => {
    if (!hasPreloaded) {
      hasPreloaded = true;
      preloadFn();
    }
  };
}; 