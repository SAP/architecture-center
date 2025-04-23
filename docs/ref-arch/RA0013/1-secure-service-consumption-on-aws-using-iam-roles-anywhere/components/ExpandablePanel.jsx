import React, { useState } from 'react'

export default function ExpandablePanel({ title, content }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        width: '100%',
        maxWidth: '520px',
        minWidth: '280px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        margin: '2rem 0',
        padding: '1.25rem 1.5rem',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid #e0e0e0',
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: '#1f2937' }}>{title}</span>
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.25s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4b5563"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '1rem',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            color: '#374151',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}