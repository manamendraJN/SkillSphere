import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateNewLearningPlan = () => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('');
  const [modules, setModules] = useState('');
  const navigate = useNavigate();

  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = async () => {
    if (!title || !description || !duration || !deadline || !status || !modules) {
      return alert('Please fill out all fields');
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/learning-plans',
        {
          title,
          description,
          duration,
          deadline,
          status,
          modules: modules.split(',').map((m) => m.trim()),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Learning plan created:', response.data);
      navigate('/learning-plans');
    } catch (error) {
      console.error('Error adding learning plan:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Learning Plan</h2>
      
      <div className="mb-6 grid gap-2">
        <input
          type="text"
          placeholder="Title"
          className="border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          className="border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Duration (hrs)"
          className="border p-2"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <input
          type="date"
          className="border p-2"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={today} // Ensure the deadline is a future date
        />
        <select
          className="border p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">-- Select Status --</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <input
          type="text"
          placeholder="Modules (comma-separated)"
          className="border p-2"
          value={modules}
          onChange={(e) => setModules(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          ➕ Add Learning Plan
        </button>
      </div>
    </div>
  );
};

export default CreateNewLearningPlan;
