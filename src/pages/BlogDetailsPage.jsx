import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiClock, FiUser, FiArrowLeft, FiShare2, FiTwitter, FiFacebook, FiCopy } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../api/axios'
import toast from 'react-hot-toast'

// Helper to render markdown-like content into beautiful HTML/React elements
const renderBlogContent = (content) => {
  if (!content) return null
  
  const paragraphs = content.split('\n\n')
  
  return paragraphs.map((block, idx) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    // Heading 3: ### Heading
    if (trimmed.startsWith('###')) {
      return (
        <h3 key={idx} className="text-black font-extrabold text-xl md:text-2xl mt-8 mb-4 border-b border-black/5 pb-2 uppercase tracking-wide">
          {trimmed.replace('###', '').trim()}
        </h3>
      )
    }

    // Heading 2: ## Heading
    if (trimmed.startsWith('##')) {
      return (
        <h2 key={idx} className="text-black font-black text-2xl md:text-3xl mt-10 mb-4 border-b border-black/10 pb-3 uppercase tracking-wide">
          {trimmed.replace('##', '').trim()}
        </h2>
      )
    }

    // List items starting with "-" or "*"
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const items = trimmed.split('\n').map((item, i) => {
        const clean = item.replace(/^[-*]\s*/, '').trim()
        
        // Inline bold parsing: **bold text**
        const parts = clean.split('**')
        const formatted = parts.map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={index} className="font-extrabold text-black">{part}</strong>
          }
          return part
        })
        
        return (
          <li key={i} className="flex items-start gap-2 text-gray-600 text-sm md:text-base leading-relaxed mb-2.5">
            <span className="text-gold mt-1.5 text-xs font-black">■</span>
            <span className="flex-1">{formatted}</span>
          </li>
        )
      })
      return <ul key={idx} className="my-6 pl-1 space-y-1">{items}</ul>
    }

    // Numbered list items starting with "1. " or "2. "
    if (/^\d+\.\s*/.test(trimmed)) {
      const items = trimmed.split('\n').map((item, i) => {
        const clean = item.replace(/^\d+\.\s*/, '').trim()
        
        // Inline bold parsing: **bold text**
        const parts = clean.split('**')
        const formatted = parts.map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={index} className="font-extrabold text-black">{part}</strong>
          }
          return part
        })
        
        return (
          <li key={i} className="flex items-start gap-3 text-gray-600 text-sm md:text-base leading-relaxed mb-2.5">
            <span className="bg-gold/15 text-gold rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-gold/30">
              {i + 1}
            </span>
            <span className="flex-1">{formatted}</span>
          </li>
        )
      })
      return <ol key={idx} className="my-6 pl-1 space-y-1">{items}</ol>
    }

    // Standard paragraph with inline bold parsing
    const parts = trimmed.split('**')
    const formattedParagraph = parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-black text-black">{part}</strong>
      }
      return part
    })

    return (
      <p key={idx} className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 font-medium">
        {formattedParagraph}
      </p>
    )
  })
}

export default function BlogDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState({ blog: null, related: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlogDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: blogData } = await api.get(`/blogs/post/${slug}`)
        setData(blogData)
        
        // Dynamic SEO Meta Title Tag
        document.title = blogData.blog?.metaTitle || `${blogData.blog?.title} | OdishaShop`
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Blog post not found')
      } finally {
        setLoading(false)
      }
    }
    fetchBlogDetails()
  }, [slug])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!', { style: { background: '#111', color: '#fff', border: '1px solid #C8A951' } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold mb-3" />
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Loading Article...</p>
      </div>
    )
  }

  if (error || !data.blog) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5 py-24 text-center">
        <div className="text-5xl mb-4">🌾</div>
        <h2 className="text-2xl font-black text-black uppercase">Article Not Found</h2>
        <p className="text-gray-400 text-sm max-w-sm mt-2 mb-8 leading-relaxed">
          The blog article you are looking for might have been moved, deleted, or the address was entered incorrectly.
        </p>
        <Link to="/blogs" className="btn-gold flex items-center gap-2">
          <FiArrowLeft size={14}/> Back to Journal
        </Link>
      </div>
    )
  }

  const { blog, related } = data
  const shareUrl = encodeURIComponent(window.location.href)
  const shareTitle = encodeURIComponent(blog.title)

  return (
    <div className="bg-cream min-h-screen pb-24 text-left">
      {/* Dynamic SEO Meta Title Tag */}
      <title>{blog.metaTitle || blog.title}</title>
      <meta name="description" content={blog.metaDescription || blog.shortDescription} />

      {/* Floating Header Banner / Cover */}
      <div className="max-w-4xl mx-auto px-5 pt-8">
        <button
          onClick={() => navigate('/blogs')}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors mb-8"
        >
          <FiArrowLeft size={14} className="text-gold" /> Back to Journal
        </button>

        {/* Categories / Tag Header */}
        <span className="bg-[#111] text-gold border border-gold/30 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
          {blog.category}
        </span>

        {/* Title */}
        <h1 className="text-black font-black text-3xl md:text-5xl leading-tight uppercase mt-6 mb-6">
          {blog.title}
        </h1>

        {/* Meta Section */}
        <div className="flex flex-wrap items-center justify-between border-y border-black/8 py-4 gap-4 mb-10">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-extrabold shadow-sm uppercase">
                {blog.author ? blog.author[0] : 'O'}
              </div>
              <div className="text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider leading-none">Written By</span>
                <span className="text-xs font-extrabold text-black mt-1 block">{blog.author || 'OdishaShop'}</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-black/8 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <FiClock size={16} className="text-gold" />
              <div className="text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider leading-none">Published On</span>
                <span className="text-xs font-extrabold text-black mt-1 block">
                  {new Date(blog.publishDate || blog.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mr-1.5 flex items-center gap-1">
              <FiShare2 size={12}/> Share
            </span>
            <a
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-black/8 text-gray-500 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 flex items-center justify-center transition-all shadow-sm"
              title="Share on Twitter"
            >
              <FiTwitter size={14} />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-black/8 text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2]/30 flex items-center justify-center transition-all shadow-sm"
              title="Share on Facebook"
            >
              <FiFacebook size={14} />
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-black/8 text-gray-500 hover:text-[#25D366] hover:border-[#25D366]/30 flex items-center justify-center transition-all shadow-sm"
              title="Share on WhatsApp"
            >
              <FaWhatsapp size={14} />
            </a>
            <button
              onClick={handleCopyLink}
              className="w-8 h-8 rounded-full bg-white border border-black/8 text-gray-500 hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all shadow-sm"
              title="Copy Link"
            >
              <FiCopy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="max-w-5xl mx-auto px-5 mb-12">
        <div className="aspect-[21/9] w-full rounded-[2.5rem] overflow-hidden border border-black/5 bg-black/10 shadow-lg">
          <img
            src={blog.image || '/logo.png'}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Reading Article Area */}
      <div className="max-w-4xl mx-auto px-5">
        <div className="bg-white rounded-[2rem] p-6 md:p-12 border border-black/5 shadow-sm">
          {/* Article Contents Rendered */}
          <article className="prose prose-gold max-w-none">
            {renderBlogContent(blog.content)}
          </article>

          {/* Tags Section */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="border-t border-black/6 pt-8 mt-12 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Tags:</span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-cream border border-black/5 text-gray-500 font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Blogs Section */}
      {related && related.length > 0 && (
        <div className="max-w-5xl mx-auto px-5 mt-20 pt-16 border-t border-black/8">
          <h2 className="text-black font-black text-2xl uppercase tracking-wide mb-2 text-center md:text-left">
            Related Stories You Might Enjoy
          </h2>
          <div className="section-divider bg-gold h-0.5 w-16 mb-10 mx-auto md:mx-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-3xl overflow-hidden border border-black/5 flex flex-col justify-between hover:shadow-xl hover:border-gold/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div>
                  <div className="relative overflow-hidden aspect-video bg-black/10">
                    <img
                      src={b.image || '/logo.png'}
                      alt={b.title}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#111] text-gold border border-gold/30 text-[8px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full">
                      {b.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-black font-extrabold text-sm line-clamp-2 hover:text-gold transition-colors duration-200 mb-2 leading-snug">
                      <Link to={`/blog/${b.slug}`}>{b.title}</Link>
                    </h3>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                      {new Date(b.publishDate || b.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-1">
                  <Link
                    to={`/blog/${b.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-black hover:text-gold tracking-widest uppercase transition-colors"
                  >
                    Read Article <span className="text-gold">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
