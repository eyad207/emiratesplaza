'use client'
import React, { useEffect, useState } from 'react'

export default function TagsPage() {
  const [tags, setTags] = useState<{ name: string; _id: string }[]>([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchTags() {
      setLoading(true)
      const response = await fetch('/api/tags')
      const data = await response.json()
      if (data.success) setTags(data.tags)
      setLoading(false)
    }
    fetchTags()
  }, [])

  const addTag = async () => {
    if (newTag.trim()) {
      setLoading(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag }),
      })
      const data = await response.json()
      if (data.success) {
        setTags((prev) => [...prev, { name: newTag, _id: data._id }])
        setNewTag('')
      } else {
        alert(data.message)
      }
      setLoading(false)
    }
  }

  const deleteTag = async (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setLoading(true)
      const response = await fetch(`/api/tags?id=${tagId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setTags((prev) => prev.filter((t) => t._id !== tagId))
      } else {
        alert(data.message)
      }
      setLoading(false)
    }
  }

  return (
    <div className='p-6 bg-gray-100 dark:bg-gray-900 min-h-screen'>
      <div className='max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
        <h1 className='text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100'>
          Manage Tags
        </h1>

        {/* Add Tag Section */}
        <div className='flex items-center gap-4 mb-6'>
          <input
            type='text'
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder='Enter a new tag'
            className='flex-1 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100'
          />
          <button
            onClick={addTag}
            disabled={loading}
            className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Adding...' : 'Add Tag'}
          </button>
        </div>

        {/* Tags Table */}
        <table className='w-full border-collapse border border-gray-200 dark:border-gray-700'>
          <thead className='bg-gray-100 dark:bg-gray-700'>
            <tr>
              <th className='border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-600 dark:text-gray-300'>
                Tag Name
              </th>
              <th className='border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-600 dark:text-gray-300'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr
                key={tag._id}
                className='hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                <td className='border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-gray-100'>
                  {tag.name}
                </td>
                <td className='border border-gray-200 dark:border-gray-700 px-4 py-2'>
                  <button
                    onClick={() => deleteTag(tag._id)}
                    className='text-red-500 hover:underline dark:text-red-400'
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tags.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={2}
                  className='border border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-gray-500 dark:text-gray-400'
                >
                  No tags found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Loading Indicator */}
        {loading && (
          <div className='text-center text-gray-500 dark:text-gray-400 mt-4'>
            Loading...
          </div>
        )}
      </div>
    </div>
  )
}
