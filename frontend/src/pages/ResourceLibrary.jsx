import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Edit2, Search, Tag, Folder, AlertCircle, PlusCircle, User as UserIcon, X } from 'lucide-react';

// Reusable Resource Card Component
const ResourceCard = ({ resource, user, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-teal-200"
  >
    <div className="flex items-start space-x-4">
      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-sm">
        {resource.username?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
        <p className="text-gray-600 text-sm mt-3">{resource.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full flex items-center">
            <Folder className="w-4 h-4 mr-1" /> {resource.category}
          </span>
          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full flex items-center">
            <FileText className="w-4 h-4 mr-1" /> {resource.type}
          </span>
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full flex items-center"
            >
              <Tag className="w-4 h-4 mr-1" /> {tag}
            </span>
          ))}
        </div>
        <p className="text-teal-700 text-sm font-medium mt-3">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-teal-800"
          >
            Access Resource
          </a>
        </p>
        <p className="text-teal-700 text-sm font-medium mt-3 flex items-center">
          <UserIcon className="w-4 h-4 mr-1" /> Uploaded by: {resource.username || 'Unknown'}
        </p>
      </div>
    </div>
    {user && resource.userId === user.id && (
      <div className="mt-4 flex items-center justify-end space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(resource)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors flex items-center text-sm"
          aria-label="Edit resource"
        >
          <Edit2 className="w-4 h-4 mr-1" /> Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(resource.id)}
          className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center text-sm"
          aria-label="Delete resource"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </motion.button>
      </div>
    )}
  </motion.div>
);

// Reusable Resource Form Modal Component
const ResourceFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-teal-800">{isEditing ? 'Edit Resource' : 'Add Resource'}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resource Title"
                className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
                required
                aria-label="Resource title"
              />
              <label className="absolute -top-2 left-2 px-1 text-sm text-gray-600 bg-white transition-all">
                Title
              </label>
            </div>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Resource Description"
                className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
                rows="4"
                required
                aria-label="Resource description"
              />
              <label className="absolute -top-2 left-2 px-1 text-sm text-gray-600 bg-white transition-all">
                Description
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Category (e.g., Programming)"
                className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
                required
                aria-label="Resource category"
              />
              <label className="absolute -top-2 left-2 px-1 text-sm text-gray-600 bg-white transition-all">
                Category
              </label>
            </div>
            <div className="relative">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
                required
                aria-label="Resource type"
              >
                <option value="PDF">PDF</option>
                <option value="Link">Link</option>
                <option value="Text">Text</option>
              </select>
              <label className="absolute -top-2 left-2 px-1 text-sm text-gray-600 bg-white transition-all">
                Type
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="Resource URL"
                className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
                required
                aria-label="Resource URL"
              />
              <label className="absolute -top-2 left-2 px-1 text-sm text-gray-600 bg-white transition-all">
                URL
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Tags (comma-separated)"
                className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
                aria-label="Resource tags"
              />
              <label className="absolute -top-2 left-2 px-1 text-sm text-gray-600 bg-white transition-all">
                Tags
              </label>
              <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center text-sm"
                aria-label={isEditing ? 'Update resource' : 'Add resource'}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                {isEditing ? 'Update' : 'Add'} Resource
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors flex items-center text-sm"
                aria-label="Cancel"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Main Resource Library Component
const ResourceLibrary = () => {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState(null);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'PDF',
    url: '',
    tags: '',
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch all resources on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view resources');
      return;
    }

    axios
      .get('http://localhost:8080/api/resources/getall', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setResources(response.data);
        setFilteredResources(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error('Error fetching resources:', error);
        setError('Failed to load resources');
      });
  }, []);

  // Filter resources based on search term (tags) or category
  useEffect(() => {
    if (searchTerm) {
      axios
        .get(`http://localhost:8080/api/resources/tag/${searchTerm}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => {
          setFilteredResources(response.data);
        })
        .catch((error) => {
          console.error('Error searching resources:', error);
          setError('No resources match your search');
        });
    } else if (categoryFilter) {
      axios
        .get(`http://localhost:8080/api/resources/category/${categoryFilter}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => {
          setFilteredResources(response.data);
        })
        .catch((error) => {
          console.error('Error filtering resources:', error);
          setError('No resources match the category');
        });
    } else {
      setFilteredResources(resources);
    }
  }, [searchTerm, categoryFilter, resources]);

  // Get unique categories for dropdown
  const categories = [...new Set(resources.map((resource) => resource.category))];

  // Handle resource creation
  const handleAddResource = (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      setError('Please log in to add a resource');
      return;
    }
    const resource = {
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
    };
    axios
      .post('http://localhost:8080/api/resources/create', resource, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setResources([...resources, response.data]);
        setFilteredResources([...filteredResources, response.data]);
        setFormData({
          title: '',
          description: '',
          category: '',
          type: 'PDF',
          url: '',
          tags: '',
        });
        setIsFormOpen(false);
        setError(null);
      })
      .catch((error) => {
        console.error('Error adding resource:', error);
        setError(error.response?.data || 'Failed to add resource');
      });
  };

  // Handle resource editing
  const handleEditResource = (resource) => {
    setEditingResourceId(resource.id);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      url: resource.url,
      tags: resource.tags.join(', '),
    });
    setIsFormOpen(true);
  };

  // Handle resource update
  const handleUpdateResource = (e) => {
    e.preventDefault();
    const resource = {
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
    };
    axios
      .put(`http://localhost:8080/api/resources/edit/${editingResourceId}`, resource, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setResources(resources.map((r) => (r.id === editingResourceId ? response.data : r)));
        setFilteredResources(filteredResources.map((r) => (r.id === editingResourceId ? response.data : r)));
        setEditingResourceId(null);
        setIsFormOpen(false);
        setError(null);
      })
      .catch((error) => {
        console.error('Error updating resource:', error);
        setError(error.response?.data || 'Failed to update resource');
      });
  };

  // Handle resource deletion
  const handleDeleteResource = (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    axios
      .delete(`http://localhost:8080/api/resources/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        setResources(resources.filter((r) => r.id !== id));
        setFilteredResources(filteredResources.filter((r) => r.id !== id));
        setError(null);
      })
      .catch((error) => {
        console.error('Error deleting resource:', error);
        setError(error.response?.data || 'You can only delete your own resources');
      });
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="w-8 h-8 mr-3" /> Resource Library
        </h1>
        {user && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsFormOpen(true);
              setEditingResourceId(null);
              setFormData({
                title: '',
                description: '',
                category: '',
                type: 'PDF',
                url: '',
                tags: '',
              });
            }}
            className="px-6 py-3 bg-white text-teal-700 rounded-full hover:bg-gray-100 transition-colors flex items-center text-sm font-medium"
            aria-label="Add new resource"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Add Resource
          </motion.button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-teal-200">
        <h2 className="text-lg font-semibold text-teal-800 mb-4">Search & Filter</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCategoryFilter('');
              }}
              placeholder="Search by tag..."
              className="w-full p-3 pl-10 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
              aria-label="Search resources by tag"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative flex-1">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSearchTerm('');
              }}
              className="w-full p-3 pl-10 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900"
              aria-label="Filter resources by category"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-orange-100 p-4 rounded-lg flex items-center space-x-2 text-orange-600 text-sm font-medium"
        >
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredResources.length === 0 ? (
          <p className="text-gray-700 text-sm col-span-full flex items-center">
            <FileText className="w-6 h-6 mr-2 text-teal-600" />
            {searchTerm || categoryFilter
              ? 'No resources match your search or category.'
              : 'No resources yet. Be the first to add one!'}
          </p>
        ) : (
          <AnimatePresence>
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                user={user}
                onEdit={handleEditResource}
                onDelete={handleDeleteResource}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Resource Form Modal */}
      <ResourceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingResourceId(null);
        }}
        onSubmit={editingResourceId ? handleUpdateResource : handleAddResource}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingResourceId}
      />
    </div>
  );
};

export default ResourceLibrary;