const AddCategoryCard = ({ onAddCategory }) => {
  return (
    <div className="bg-gray-50 rounded-lg border-t-4 border-dashed border-gray-300 shadow p-4 min-h-[300px] flex items-center justify-center">
      <button
        onClick={onAddCategory}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
        aria-label="Add new category"
      >
        <span className="text-xl">+</span>
        Add Category
      </button>
    </div>
  );
};

export default AddCategoryCard;
