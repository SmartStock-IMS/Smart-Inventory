import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../../../context/theme/ThemeContext.jsx";
import { 
  Plus, 
  Save, 
  RefreshCw, 
  Package, 
  FileText,
  Upload,
  X,
  Tag,
  ImageIcon,
  Edit3,
  Trash2,
  Eye,
  Search
} from "lucide-react";

const Category = () => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    category_name: "",
    description: "",
    pic_url: null
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
    pic_url: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching categories from Category page...');
      const response = await fetch('http://localhost:3000/api/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('Category page API response:', result);
      
      if (result.success && result.data) {
        const categories = result.data.categories || [];
        console.log('Categories data structure:', categories);
        console.log('Sample category:', categories[0]);
        setCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/categories/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          const imageUrl = result.data.imageUrl;
          setImagePreview(imageUrl);
          setFormData(prev => ({
            ...prev,
            pic_url: imageUrl
          }));
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      }
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      pic_url: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category_name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_name: formData.category_name.trim(),
          description: formData.description.trim() || null,
          pic_url: formData.pic_url
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Category created successfully!");
        resetForm();
        fetchCategories();
      } else {
        toast.error(result.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category_name: "",
      description: "",
      pic_url: null
    });
    setImagePreview(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setEditFormData({
      category_name: category.category_name,
      description: category.description || "",
      pic_url: category.pic_url
    });
    setEditImagePreview(category.pic_url);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditImageUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/categories/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          const imageUrl = result.data.imageUrl;
          setEditImagePreview(imageUrl);
          setEditFormData(prev => ({
            ...prev,
            pic_url: imageUrl
          }));
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      }
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.category_name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${editingCategory.category_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_name: editFormData.category_name.trim(),
          description: editFormData.description.trim() || null,
          pic_url: editFormData.pic_url
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Category updated successfully!");
        setShowEditModal(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(result.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${categoryToDelete.category_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Category deleted successfully!");
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        toast.error(result.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-2xl shadow-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Category Management</h1>
              <p className={`mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Create and manage product categories for your inventory system</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Category Form */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Form Section */}
          <div className="xl:col-span-3">
            <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">New Category</h2>
                    <p className="text-blue-100 text-sm">Fill in the details below</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Fields */}
                  <div className="space-y-4">
                    {/* Category Name Field */}
                    <div className="space-y-2">
                      <label className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        <Package className="w-4 h-4 text-blue-500" />
                        <span>Category Name</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="category_name"
                        value={formData.category_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-base font-medium ${
                          isDarkMode
                            ? 'text-gray-200 bg-gray-700 border-gray-600 placeholder-gray-400'
                            : 'text-gray-900 bg-gray-50 border-gray-200 placeholder-gray-500'
                        }`}
                        placeholder="e.g., Black Pepper, Electronics..."
                        required
                      />
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                      <label className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>Description</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-base resize-none ${
                          isDarkMode
                            ? 'text-gray-200 bg-gray-700 border-gray-600 placeholder-gray-400'
                            : 'text-gray-900 bg-gray-50 border-gray-200 placeholder-gray-500'
                        }`}
                        placeholder="Category description..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Create Category</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={resetForm}
                        className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      <span>Category Image</span>
                    </label>
                    
                    {imagePreview ? (
                      <div className="relative group">
                        <div className={`w-full h-36 rounded-xl overflow-hidden border-2 transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-100 border-gray-200'
                        }`}>
                          <img
                            src={imagePreview}
                            alt="Category preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`w-full h-36 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
                          dragActive
                            ? isDarkMode 
                              ? "border-blue-400 bg-blue-900/20" 
                              : "border-blue-400 bg-blue-50"
                            : isDarkMode
                              ? "border-gray-600 hover:border-blue-400 hover:bg-gray-700"
                              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('imageInput').click()}
                      >
                        <div className={`flex flex-col items-center justify-center h-full transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Upload className={`w-8 h-8 mb-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Upload Image</p>
                          <p className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>Click or drag & drop</p>
                        </div>
                      </div>
                    )}
                    
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Preview */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit">
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 px-4 py-3">
                <h3 className="text-base font-semibold text-white">Preview</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  {imagePreview && (
                    <div className="w-full h-20 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Name</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formData.category_name || "Category name..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                      <p className="text-xs text-gray-700">
                        {formData.description || "Description..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Categories Section */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Categories Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Existing Categories</h2>
                  <p className="text-blue-100 text-sm">{categories.length} categories found</p>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-white/20 text-white placeholder-blue-100 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 w-64"
                />
                <Search className="w-4 h-4 text-blue-100 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="p-6">
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                  <div key={category.category_id} className={`rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    {/* Category Image */}
                    {category.pic_url ? (
                      <div className="h-32 bg-gray-200">
                        <img
                          src={category.pic_url}
                          alt={category.category_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`h-32 flex items-center justify-center transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20' 
                          : 'bg-gradient-to-br from-blue-100 to-blue-50'
                      }`}>
                        <Package className={`w-8 h-8 transition-colors duration-300 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-400'
                        }`} />
                      </div>
                    )}
                    
                    {/* Category Info */}
                    <div className="p-4">
                      <h3 className={`font-semibold text-base mb-1 truncate transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {category.category_name}
                      </h3>
                      <p className={`text-sm mb-3 line-clamp-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {category.description || "No description available"}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 ${
                            isDarkMode 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center ${
                            isDarkMode 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Created Date */}
                    <div className="px-4 pb-3">
                      <p className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Created: {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {searchTerm ? "No categories found" : "No categories yet"}
                </h3>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Create your first category using the form above"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 rounded-t-2xl transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
                : 'bg-gradient-to-r from-blue-500 to-blue-400'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Edit Category</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-100' : 'text-blue-100'
                    }`}>Update category details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Category Name */}
              <div className="space-y-2">
                <label className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <Package className="w-4 h-4 text-blue-500" />
                  <span>Category Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category_name"
                  value={editFormData.category_name}
                  onChange={handleEditFormChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-base font-medium ${
                    isDarkMode 
                      ? 'text-gray-200 bg-gray-700 border-gray-600 placeholder-gray-400' 
                      : 'text-gray-900 bg-gray-50 border-gray-200 placeholder-gray-500'
                  }`}
                  placeholder="Category name..."
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Description</span>
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-base resize-none ${
                    isDarkMode 
                      ? 'text-gray-200 bg-gray-700 border-gray-600 placeholder-gray-400' 
                      : 'text-gray-900 bg-gray-50 border-gray-200 placeholder-gray-500'
                  }`}
                  placeholder="Category description..."
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Category Image</span>
                </label>
                
                {editImagePreview ? (
                  <div className="relative group">
                    <div className={`w-full h-32 rounded-xl overflow-hidden border-2 transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
                    }`}>
                      <img
                        src={editImagePreview}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditImagePreview(null);
                        setEditFormData(prev => ({ ...prev, pic_url: null }));
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-full h-32 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                    onClick={() => document.getElementById('editImageInput').click()}
                  >
                    <div className={`flex flex-col items-center justify-center h-full transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Upload className={`w-6 h-6 mb-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Upload Image</p>
                    </div>
                  </div>
                )}
                
                <input
                  id="editImageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleEditImageUpload(file);
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 rounded-t-2xl transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-red-600 to-red-500' 
                : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Category</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-red-100' : 'text-red-100'
                  }`}>This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className={`mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Are you sure you want to delete the category <strong>"{categoryToDelete.category_name}"</strong>?
                </p>
                <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-red-900/20 border-red-700/50' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className={`w-5 h-5 transition-colors duration-300 ${
                        isDarkMode ? 'text-red-400' : 'text-red-400'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-red-300' : 'text-red-800'
                      }`}>Warning</h4>
                      <p className={`text-sm mt-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-red-400' : 'text-red-700'
                      }`}>
                        This will permanently delete the category and cannot be recovered.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);
                  }}
                  className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Category</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;