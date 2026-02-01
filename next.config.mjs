/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'source.unsplash.com',
      'picsum.photos',
      'loremflickr.com',
      'placekitten.com',
      'placeimg.com',
      'via.placeholder.com',
      'placeholdit.imgix.net',
      'dummyimage.com',
      'supabase.co',
      'supabase.in',
      'supabase.com',
    ],
    unoptimized: true,
  },
}

export default nextConfig
