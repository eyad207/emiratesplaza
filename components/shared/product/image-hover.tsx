/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Image from 'next/image'
import { useState } from 'react'

const ImageHover = ({
  src,
  hoverSrc,
  alt,
}: {
  src: string
  hoverSrc: string
  alt: string
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className='relative h-full w-full'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={isHovered ? hoverSrc : src}
        alt={alt}
        fill
        sizes='80vw'
        className='object-contain'
      />
    </div>
  )
}

export default ImageHover
