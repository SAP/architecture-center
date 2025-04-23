import React, { useState } from 'react'

export default function FlipCard({ title, content }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        width: '100%',
        maxWidth: '90%',
        minWidth: '280px',
        height: 'auto',
        maxHeight: '300px',
        aspectRatio: '3 / 1',
        perspective: '1000px',
        cursor: 'pointer',
        margin: '2rem 0',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
        }}
      >
        {/* Front Side */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f4f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '1rem 1.5rem',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
           {title}
        </div>

        {/* Back Side */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#e6f4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '0.95rem',
            lineHeight: 1.4,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
