import { TagIcon } from '@heroicons/react/24/outline';

const Tags = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tag Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage flexible labels for your menu items
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="text-center py-12">
        <TagIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Tag Management</h3>
        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
          Tag management functionality will be implemented in Session 2. 
          This will allow you to create flexible labels like "Spicy", "Vegan", "Chef's Special", etc.
        </p>
        <div className="mt-6">
          <div className="inline-flex items-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Coming Soon in Session 2
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tags;
