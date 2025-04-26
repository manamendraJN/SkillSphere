import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Edit2, Search, Tag, Folder, AlertCircle, PlusCircle, User as UserIcon } from 'lucide-react';

const ResourceLibrary = () => {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState(null);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    type: 'PDF',
    url: '',
    tags: '',
  });
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: '',
    type: 'PDF',
    url: '',
    tags: '',
  });
  const [showForm, setShowForm] = useState(false);

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
    let filtered = resources;
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

  // Handle resource creation
  const handleAddResource = (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      setError('Please log in to add a resource');
      return;
    }
    const resource = {
      ...newResource,
      tags: newResource.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
    };
    axios
      .post('http://localhost:8080/api/resources/create', resource, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setResources([...resources, response.data]);
        setFilteredResources([...filteredResources, response.data]);
        setNewResource({
          title: '',
          description: '',
          category: '',
          type: 'PDF',
          url: '',
          tags: '',
        });
        setShowForm(false);
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
    setEditForm({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      url: resource.url,
      tags: resource.tags.join(', '),
    });
    setShowForm(true);
  };

  // Handle resource update
  const handleUpdateResource = (id) => {
    const resource = {
      ...editForm,
      tags: editForm.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
    };
    axios
      .put(`http://localhost:8080/api/resources/edit/${id}`, resource, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setResources(resources.map((r) => (r.id === id ? response.data : r)));
        setFilteredResources(filteredResources.map((r) => (r.id === id ? response.data : r)));
        setEditingResourceId(null);
        setShowForm(false);
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
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      {/* Header and Search */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-teal-800 flex items-center">
          <FileText className="w-6 h-6 mr-1 text-teal-600" /> Resource Library
        </h2>
        <div className="flex items-center space-x-2">
          <div className="relative w-1/4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCategoryFilter('');
              }}
              placeholder="Search by tag..."
              className="w-full p-2 pl-8 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-600" />
          </div>
          <div className="relative w-1/4">
            <input
              type="text"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSearchTerm('');
              }}
              placeholder="Filter by category..."
              className="w-full p-2 pl-8 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
            />
            <Folder className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-orange-100 p-2 rounded-lg flex items-center space-x-1 text-orange-600 text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* Add Resource Button */}
      {!showForm && user && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowForm(true);
            setEditingResourceId(null);
            setEditForm({
              title: '',
              description: '',
              category: '',
              type: 'PDF',
              url: '',
              tags: '',
            });
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center text-sm"
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Add New Resource
        </motion.button>
      )}

      {/* Resource Form */}
      {showForm && user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-white rounded-xl shadow-md border border-teal-200 mb-4"
        >
          <h3 className="text-lg font-bold text-teal-800 mb-3">
            {editingResourceId ? 'Edit Resource' : 'Add Resource'}
          </h3>
          <form onSubmit={editingResourceId ? () => handleUpdateResource(editingResourceId) : handleAddResource}>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={editingResourceId ? editForm.title : newResource.title}
                  onChange={(e) =>
                    editingResourceId
                      ? setEditForm({ ...editForm, title: e.target.value })
                      : setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder="Resource Title"
                  className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                  required
                />
                <label className="absolute -top-1.5 left-2 px-1 text-xs text-gray-600 bg-white transition-all">
                  Title
                </label>
              </div>
              <div className="relative">
                <textarea
                  value={editingResourceId ? editForm.description : newResource.description}
                  onChange={(e) =>
                    editingResourceId
                      ? setEditForm({ ...editForm, description: e.target.value })
                      : setNewResource({ ...newResource, description: e.target.value })
                  }
                  placeholder="Resource Description"
                  className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                  rows="3"
                  required
                />
                <label className="absolute -top-1.5 left-2 px-1 text-xs text-gray-600 bg-white transition-all">
                  Description
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={editingResourceId ? editForm.category : newResource.category}
                  onChange={(e) =>
                    editingResourceId
                      ? setEditForm({ ...editForm, category: e.target.value })
                      : setNewResource({ ...newResource, category: e.target.value })
                  }
                  placeholder="Category (e.g., Programming)"
                  className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                  required
                />
                <label className="absolute -top-1.5 left-2 px-1 text-xs text-gray-600 bg-white transition-all">
                  Category
                </label>
              </div>
              <div className="relative">
                <select
                  value={editingResourceId ? editForm.type : newResource.type}
                  onChange={(e) =>
                    editingResourceId
                      ? setEditForm({ ...editForm, type: e.target.value })
                      : setNewResource({ ...newResource, type: e.target.value })
                  }
                  className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                  required
                >
                  <option value="PDF">PDF</option>
                  <option value="Link">Link</option>
                  <option value="Text">Text</option>
                </select>
                <label className="absolute -top-1.5 left-2 px-1 text-xs text-gray-600 bg-white transition-all">
                  Type
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={editingResourceId ? editForm.url : newResource.url}
                  onChange={(e) =>
                    editingResourceId
                      ? setEditForm({ ...editForm, url: e.target.value })
                      : setNewResource({ ...newResource, url: e.target.value })
                  }
                  placeholder="Resource URL"
                  className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                  required
                />
                <label className="absolute -top-1.5 left-2 px-1 text-xs text-gray-600 bg-white transition-all">
                  URL
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={editingResourceId ? editForm.tags : newResource.tags}
                  onChange={(e) =>
                    editingResourceId
                      ? setEditForm({ ...editForm, tags: e.target.value })
                      : setNewResource({ ...newResource, tags: e.target.value })
                  }
                  placeholder="Tags (comma-separated)"
                  className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                />
                <label className="absolute -top-1.5 left-2 px-1 text-xs text-gray-600 bg-white transition-all">
                  Tags
                </label>
                <Tag className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-600" />
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-3 py-1 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center text-sm"
                >
                  <PlusCircle className="w-3 h-3 mr-1" />
                  {editingResourceId ? 'Update' : 'Add'} Resource
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowForm(false);
                    setEditingResourceId(null);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors flex items-center text-sm"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Resource List */}
      {filteredResources.length === 0 ? (
        <p className="text-gray-700 text-sm flex items-center">
          <FileText className="w-4 h-4 mr-1 text-teal-600" />
          {searchTerm || categoryFilter
            ? 'No resources match your search or category.'
            : 'No resources yet. Be the first to add one!'}
        </p>
      ) : (
        <AnimatePresence>
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-teal-200"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-sm">
                  {resource.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{resource.title}</h3>
                  <p className="text-gray-800 text-sm mt-1">{resource.description}</p>
                  <p className="text-teal-700 text-sm font-medium mt-1 flex items-center">
                    <Folder className="w-3 h-3 mr-1" /> Category: {resource.category}
                  </p>
                  <p className="text-teal-700 text-sm font-medium mt-1 flex items-center">
                    <FileText className="w-3 h-3 mr-1" /> Type: {resource.type}
                  </p>
                  <p className="text-teal-700 text-sm font-medium mt-1 flex items-center">
                    <Tag className="w-3 h-3 mr-1" /> Tags: {resource.tags.join(', ')}
                  </p>
                  <p className="text-teal-700 text-sm font-medium mt-1">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-teal-800"
                    >
                      Access Resource
                    </a>
                  </p>
                  <p className="text-teal-700 text-sm font-medium mt-1 flex items-center">
                    <UserIcon className="w-3 h-3 mr-1" /> Uploaded by: {resource.username || 'Unknown'}
                  </p>
                </div>
              </div>
              {user && resource.userId === user.id && (
                <div className="mt-2 flex items-center justify-end space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditResource(resource)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors flex items-center text-sm"
                  >
                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteResource(resource.id)}
                    className="px-2 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center text-sm"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default ResourceLibrary;