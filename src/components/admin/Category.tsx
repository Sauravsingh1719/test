
'use client';

import { useState } from 'react';
import axios from 'axios';

type Subcategory = {
  name: string;
  description: string;
};

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const handleAddSub = () => {
    if (!subName.trim()) return;
    setSubcategories([...subcategories, { name: subName, description: subDesc }]);
    setSubName('');
    setSubDesc('');
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/api/categories', {
        name,
        description,
        subcategories,
      });
      if (res.data.success) {
        alert('Category created!');
        // reset form
        setName('');
        setDescription('');
        setSubcategories([]);
      } else {
        alert('Error: ' + (res.data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Request failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h2>Create Category</h2>

      <div>
        <label>Category Name:</label><br />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div>
        <label>Description:</label><br />
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <hr />

      <h3>Subcategories</h3>
      {subcategories.map((sub, i) => (
        <div key={i}>
          • {sub.name} — {sub.description}
        </div>
      ))}

      <div>
        <label>Subcategory Name:</label><br />
        <input
          type="text"
          value={subName}
          onChange={e => setSubName(e.target.value)}
        />
      </div>

      <div>
        <label>Subcategory Description:</label><br />
        <input
          type="text"
          value={subDesc}
          onChange={e => setSubDesc(e.target.value)}
        />
      </div>

      <button type="button" onClick={handleAddSub}>
        Add Subcategory
      </button>

      <hr />

      <button type="button" onClick={handleSubmit}>
        Create Category
      </button>
    </div>
  );
}
