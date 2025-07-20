import { useState, useEffect, useRef, useCallback } from 'react';
import { getTags, createTag, updateTag, deleteTag } from '../services/tagService';

export const useTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTags: 0,
    activeTags: 0
  });
  const hasExecutedRef = useRef(false);

  // Fetch tags from API
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTags();
      
      if (response.data) {
        setTags(response.data.tags || []);
        setStats({
          totalTags: response.data.totalTags || 0,
          activeTags: response.data.activeTags || 0
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err.message || 'Failed to fetch tags');
      setTags([]);
      setStats({ totalTags: 0, activeTags: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tags on component mount
  useEffect(() => {
    if (!hasExecutedRef.current) {
      hasExecutedRef.current = true;
      fetchTags();
    }
  }, [fetchTags]);

  // Create a new tag
  const handleCreateTag = async (tagData) => {
    try {
      const response = await createTag(tagData);
      
      if (response.data?.tag) {
        // Add menu items count (will be 0 for new tags)
        const newTag = { ...response.data.tag, menuItemsCount: 0 };
        setTags(prevTags => [...prevTags, newTag]);
        setStats(prevStats => ({
          totalTags: prevStats.totalTags + 1,
          activeTags: newTag.isActive ? prevStats.activeTags + 1 : prevStats.activeTags
        }));
        return { success: true, tag: newTag };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error creating tag:', err);
      throw err;
    }
  };

  // Update an existing tag
  const handleUpdateTag = async (tagId, tagData) => {
    try {
      const response = await updateTag(tagId, tagData);
      
      if (response.data?.tag) {
        const updatedTag = response.data.tag;
        
        setTags(prevTags => 
          prevTags.map(tag => 
            tag._id === tagId ? updatedTag : tag
          )
        );
        
        // Recalculate stats
        setTags(currentTags => {
          const updatedTags = currentTags.map(tag => 
            tag._id === tagId ? updatedTag : tag
          );
          setStats({
            totalTags: updatedTags.length,
            activeTags: updatedTags.filter(tag => tag.isActive).length
          });
          return updatedTags;
        });
        
        return { success: true, tag: updatedTag };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error updating tag:', err);
      throw err;
    }
  };

  // Delete a tag
  const handleDeleteTag = async (tagId) => {
    try {
      const response = await deleteTag(tagId);
      
      if (response.success) {
        const deletedTag = tags.find(tag => tag._id === tagId);
        
        setTags(prevTags => prevTags.filter(tag => tag._id !== tagId));
        setStats(prevStats => ({
          totalTags: prevStats.totalTags - 1,
          activeTags: deletedTag?.isActive ? prevStats.activeTags - 1 : prevStats.activeTags
        }));
        
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error deleting tag:', err);
      throw err;
    }
  };

  // Toggle tag active status
  const handleToggleTagStatus = async (tagId) => {
    const tag = tags.find(t => t._id === tagId);
    if (!tag) return;

    try {
      return await handleUpdateTag(tagId, { 
        isActive: !tag.isActive 
      });
    } catch (err) {
      console.error('Error toggling tag status:', err);
      throw err;
    }
  };

  // Get active tags only
  const getActiveTags = useCallback(() => {
    return tags.filter(tag => tag.isActive);
  }, [tags]);

  // Search tags by name
  const searchTags = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return tags;
    
    const searchLower = searchTerm.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower) ||
      tag.slug.toLowerCase().includes(searchLower)
    );
  }, [tags]);

  return {
    // State
    tags,
    loading,
    error,
    stats,
    
    // Actions
    fetchTags,
    createTag: handleCreateTag,
    updateTag: handleUpdateTag,
    deleteTag: handleDeleteTag,
    toggleTagStatus: handleToggleTagStatus,
    
    // Utilities
    getActiveTags,
    searchTags,
    
    // Refresh function
    refresh: fetchTags
  };
};
