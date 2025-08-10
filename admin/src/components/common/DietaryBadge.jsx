export const DietaryBadge = ({ isVeg }) => {
  return (
    <div className={`flex bg-white items-center justify-center w-4 h-4 border-2 ${
      isVeg ? 'border-green-600' : 'border-red-500'
    }`}>
      {isVeg ? (
        <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
      ) : (
        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-red-500 rounded-sm" />
      )}
    </div>
  );
}; 