import { Building2 } from 'lucide-react';

export default function Header({ restaurant }) {
  if (!restaurant) return null;

  // Determine which logo to show and whether to show the name
  const shouldHideName = restaurant.hideRestaurantNameInHeader === true && restaurant.primaryLogoUrl;
  const logoUrl = restaurant.brandMarkUrl || restaurant.primaryLogoUrl;
  const showName = !shouldHideName;

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo/Avatar */}
          <div className="flex-shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${restaurant.name} logo`}
                className={`rounded-lg object-contain ${
                  restaurant.brandMarkUrl ? 'w-16 h-16' : 'h-16'
                }`}
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
            )}
          </div>

          {/* Restaurant Info - Only show if not hiding name */}
          {showName && (
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg text-text-primary truncate">
                {restaurant.name}
              </h1>
              <p className="text-sm text-text-secondary">
                Digital Menu
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
