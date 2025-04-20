'use client'
import React, { useEffect, useState } from 'react'

export default function TagsPage() {
  const [tags, setTags] = useState<{ name: string; _id: string }[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    async function fetchTags() {
      const response = await fetch('/api/tags')
      const data = await response.json()
      if (data.success) setTags(data.tags)
    }
    fetchTags()
  }, [])

  const addTag = async () => {
    if (newTag.trim()) {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag }),
      })
      const data = await response.json()
      if (data.success) {
        setTags((prev) => [...prev, { name: newTag, _id: data._id }]) // Ensure _id is used
        setNewTag('')
      }
    }
  }

  const deleteTag = async (tagId: string) => {
    const response = await fetch(`/api/tags?id=${tagId}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (data.success) {
      setTags((prev) => prev.filter((t) => t._id !== tagId)) // Remove tag from state
    } else {
      alert(data.message) // Show error message if deletion fails
    }
  }

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4'>Manage Tags</h1>
      <div className='mb-4'>
        <input
          type='text'
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder='Enter a new tag'
          className='border px-2 py-1 mr-2'
        />
        <button
          onClick={addTag}
          className='bg-blue-500 text-white px-4 py-1 rounded'
        >
          Add Tag
        </button>
      </div>
      <ul className='list-disc pl-5'>
        {tags.map((tag) => (
          <li key={tag._id} className='flex justify-between items-center mb-2'>
            <span>{tag.name}</span>
            <button
              onClick={() => deleteTag(tag._id)}
              className='text-red-500 hover:underline'
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
