import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function CategorySheet({ isOpen, onClose, categories, itemsByCategory }) {
  const handleCategoryClick = (categoryId) => {
    onClose();
    
    // Smooth scroll to category
    setTimeout(() => {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-lg text-text-primary">
                Menu Categories
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-2">
                {categories.map((category) => {
                  const itemCount = itemsByCategory[category.id]?.length || 0;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      disabled={itemCount === 0}
                      className="w-full px-4 py-3 text-left hover:bg-surface-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary truncate">
                            {category.name}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
