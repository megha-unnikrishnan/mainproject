// src/components/TagInput.js

import React, { useState } from 'react';

const TagInput = ({ onTagsChange }) => {
    const [tag, setTag] = useState('');
    const [tags, setTags] = useState([]);

    const handleAddTag = () => {
        if (tag && !tags.includes(tag)) {
            setTags((prevTags) => [...prevTags, tag]);
            onTagsChange([...tags, tag]); // Update parent component with new tags
            setTag(''); // Clear the input field
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        const updatedTags = tags.filter((t) => t !== tagToRemove);
        setTags(updatedTags);
        onTagsChange(updatedTags); // Update parent component with removed tags
    };

    return (
        <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                    <span key={tag} className="bg-blue-600 text-white px-2 py-1 rounded">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-red-500">&times;</button>
                    </span>
                ))}
            </div>
            <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag (press Enter to add)"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

export default TagInput;
