export const DietaryBadge = ({ isVeg }) => {
  return (
    <div className={`flex items-center justify-center w-5 h-5 border-2 ${
      isVeg ? 'border-green-600' : 'border-red-500'
    }`}>
      {isVeg ? (
        <div className="w-3.5 h-3.5 rounded-full bg-green-600" />
      ) : (
        <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-b-[9px] border-l-transparent border-r-transparent border-b-red-500 rounded-sm" />
      )}
    </div>
  );
}; 