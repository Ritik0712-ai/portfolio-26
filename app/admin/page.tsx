'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lock, LayoutDashboard, FileText, FolderKanban, Mail, LogOut, Plus, Trash2, Eye, BarChart3, MessageSquareQuote, Calendar, Star, Check, X } from 'lucide-react'

type Tab = 'dashboard' | 'blogs' | 'projects' | 'stats' | 'testimonials' | 'timeline' | 'feedback'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [blogs, setBlogs] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showStatForm, setShowStatForm] = useState(false)
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [showTimelineForm, setShowTimelineForm] = useState(false)

  const [newBlog, setNewBlog] = useState({
    title: '', excerpt: '', content: '', tags: '', category: 'Tech', reading_time: '5 min read',
  })

  const [newProject, setNewProject] = useState({
    title: '', description: '', full_description: '', technologies: '', demo_url: '', repo_url: '', featured: false,
  })

  const [newStat, setNewStat] = useState({
    icon: 'Code', value: 0, suffix: '+', label: '', display_order: 0,
  })

  const [newTestimonial, setNewTestimonial] = useState({
    name: '', role: '', company: '', content: '', rating: 5, approved: true, display_order: 10,
  })

  const [newTimeline, setNewTimeline] = useState({
    icon: 'Code', title: '', description: '', event_date: '', event_type: 'default', display_order: 0,
  })

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchData()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      fetchData()
    } else {
      alert('Invalid password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setPassword('')
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [blogsRes, projectsRes, statsRes, testimonialsRes, timelineRes, feedbackRes] = await Promise.all([
        fetch('/api/admin/blogs'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/testimonials'),
        fetch('/api/admin/timeline'),
        fetch('/api/admin/feedback'),
      ])
      const [blogsData, projectsData, statsData, testimonialsData, timelineData, feedbackData] = await Promise.all([
        blogsRes.json(), projectsRes.json(), statsRes.json(), testimonialsRes.json(), timelineRes.json(), feedbackRes.json()
      ])
      setBlogs(blogsData.blogs || [])
      setProjects(projectsData.projects || [])
      setStats(statsData.stats || [])
      setTestimonials(testimonialsData.testimonials || [])
      setTimelineEvents(timelineData.events || [])
      setFeedback(feedbackData.feedback || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  const createSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // Blog handlers
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    const blog = {
      title: newBlog.title, slug: createSlug(newBlog.title), excerpt: newBlog.excerpt, content: newBlog.content,
      tags: newBlog.tags.split(',').map(t => t.trim()).filter(t => t), category: newBlog.category, reading_time: newBlog.reading_time,
      published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    const res = await fetch('/api/admin/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blog) })
    if (res.ok) { await fetchData(); setShowBlogForm(false); setNewBlog({ title: '', excerpt: '', content: '', tags: '', category: 'Tech', reading_time: '5 min read' }) }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog?')) return
    const res = await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' })
    if (res.ok) await fetchData()
  }

  // Project handlers
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const project = {
      title: newProject.title, slug: createSlug(newProject.title), description: newProject.description, full_description: newProject.full_description,
      technologies: newProject.technologies.split(',').map(t => t.trim()).filter(t => t), demo_url: newProject.demo_url, repo_url: newProject.repo_url,
      featured: newProject.featured, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) })
    if (res.ok) { await fetchData(); setShowProjectForm(false); setNewProject({ title: '', description: '', full_description: '', technologies: '', demo_url: '', repo_url: '', featured: false }) }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' })
    if (res.ok) await fetchData()
  }

  // Stats handlers
  const handleCreateStat = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newStat) })
    if (res.ok) { await fetchData(); setShowStatForm(false); setNewStat({ icon: 'Code', value: 0, suffix: '+', label: '', display_order: 0 }) }
  }

  const handleUpdateStat = async (id: string, updates: any) => {
    const res = await fetch(`/api/admin/stats?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    if (res.ok) await fetchData()
  }

  const handleDeleteStat = async (id: string) => {
    if (!confirm('Delete this stat?')) return
    const res = await fetch(`/api/admin/stats?id=${id}`, { method: 'DELETE' })
    if (res.ok) await fetchData()
  }

  // Testimonial handlers
  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTestimonial) })
    if (res.ok) { await fetchData(); setShowTestimonialForm(false); setNewTestimonial({ name: '', role: '', company: '', content: '', rating: 5, approved: true, display_order: 10 }) }
  }

  const handleUpdateTestimonial = async (id: string, updates: any) => {
    const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    if (res.ok) await fetchData()
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' })
    if (res.ok) await fetchData()
  }

  // Timeline handlers
  const handleCreateTimeline = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/timeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTimeline) })
    if (res.ok) { await fetchData(); setShowTimelineForm(false); setNewTimeline({ icon: 'Code', title: '', description: '', event_date: '', event_type: 'default', display_order: 0 }) }
  }

  const handleUpdateTimeline = async (id: string, updates: any) => {
    const res = await fetch(`/api/admin/timeline?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    if (res.ok) await fetchData()
  }

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Delete this timeline event?')) return
    const res = await fetch(`/api/admin/timeline?id=${id}`, { method: 'DELETE' })
    if (res.ok) await fetchData()
  }

  // Feedback handlers
  const handleConvertToTestimonial = async (fb: any) => {
    if (!confirm(`Convert feedback from ${fb.name} to testimonial?`)) return
    const res = await fetch('/api/admin/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId: fb.id, name: fb.name, role: fb.role, company: fb.company, content: fb.content, rating: fb.rating })
    })
    if (res.ok) { await fetchData(); alert('Testimonial created!') }
  }

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return
    const res = await fetch(`/api/admin/feedback?id=${id}`, { method: 'DELETE' })
    if (res.ok) await fetchData()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-8 border border-primary/10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Login</h1>
            <p className="text-text-muted mt-2">Enter password to access dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
              className="w-full px-4 py-3 bg-card border border-primary/20 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary" />
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all">
              Login
            </button>
          </form>
          <p className="text-center text-text-muted text-sm mt-4">Default password: admin123</p>
        </motion.div>
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const inputClass = "w-full px-4 py-3 bg-card border border-primary/20 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: Star },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
            <p className="text-text-muted">Manage your portfolio content</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-card border border-primary/20 rounded-lg text-text-muted hover:text-primary transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-card text-text-muted hover:text-primary'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[{ label: 'Blog Posts', value: blogs.length, icon: FileText, color: 'primary' },
              { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'accent' },
              { label: 'Stats', value: stats.length, icon: BarChart3, color: 'green' },
              { label: 'Testimonials', value: testimonials.length, icon: MessageSquareQuote, color: 'purple' },
              { label: 'Timeline', value: timelineEvents.length, icon: Calendar, color: 'orange' },
              { label: 'Feedback', value: feedback.length, icon: Star, color: 'yellow' },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-${item.color}/20 rounded-lg flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 text-${item.color}`} />
                  </div>
                  <div><p className="text-3xl font-bold text-text-primary">{item.value}</p><p className="text-text-muted text-sm">{item.label}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Blog Posts</h2>
              <button onClick={() => setShowBlogForm(!showBlogForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> New Blog
              </button>
            </div>
            {showBlogForm && (
              <form onSubmit={handleCreateBlog} className="bg-card rounded-xl p-6 border border-primary/10 mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Create New Blog Post</h3>
                <input type="text" value={newBlog.title} onChange={(e) => setNewBlog({...newBlog, title: e.target.value})} placeholder="Blog Title" required className={inputClass} />
                <input type="text" value={newBlog.excerpt} onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})} placeholder="Short excerpt" required className={inputClass} />
                <textarea value={newBlog.content} onChange={(e) => setNewBlog({...newBlog, content: e.target.value})} placeholder="Blog content" required rows={8} className={`${inputClass} resize-none`} />
                <div className="grid md:grid-cols-3 gap-4">
                  <input type="text" value={newBlog.tags} onChange={(e) => setNewBlog({...newBlog, tags: e.target.value})} placeholder="Tags (comma separated)" className={inputClass} />
                  <select value={newBlog.category} onChange={(e) => setNewBlog({...newBlog, category: e.target.value})} className={inputClass}>
                    <option value="Tech">Tech</option><option value="DSA">DSA</option><option value="Life">Life</option><option value="Reflections">Reflections</option>
                  </select>
                  <input type="text" value={newBlog.reading_time} onChange={(e) => setNewBlog({...newBlog, reading_time: e.target.value})} placeholder="Reading time" className={inputClass} />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">Create Blog</button>
                  <button type="button" onClick={() => setShowBlogForm(false)} className="px-6 py-3 bg-card border border-primary/20 text-text-muted rounded-lg">Cancel</button>
                </div>
              </form>
            )}
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-card rounded-xl p-6 border border-primary/10 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{blog.title}</h3>
                    <p className="text-sm text-text-muted mt-1">{blog.excerpt?.substring(0, 80)}...</p>
                    <div className="flex gap-2 mt-2">{blog.tags?.map((tag: string) => <span key={tag} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">{tag}</span>)}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/blog/${blog.slug}`} target="_blank" className="p-2 text-text-muted hover:text-primary"><Eye className="w-5 h-5" /></Link>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Projects</h2>
              <button onClick={() => setShowProjectForm(!showProjectForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
            {showProjectForm && (
              <form onSubmit={handleCreateProject} className="bg-card rounded-xl p-6 border border-primary/10 mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Create New Project</h3>
                <input type="text" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} placeholder="Project Title" required className={inputClass} />
                <input type="text" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} placeholder="Short description" required className={inputClass} />
                <textarea value={newProject.full_description} onChange={(e) => setNewProject({...newProject, full_description: e.target.value})} placeholder="Full description" required rows={4} className={`${inputClass} resize-none`} />
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" value={newProject.technologies} onChange={(e) => setNewProject({...newProject, technologies: e.target.value})} placeholder="Technologies (comma separated)" className={inputClass} />
                  <input type="text" value={newProject.repo_url} onChange={(e) => setNewProject({...newProject, repo_url: e.target.value})} placeholder="GitHub URL" className={inputClass} />
                </div>
                <input type="text" value={newProject.demo_url} onChange={(e) => setNewProject({...newProject, demo_url: e.target.value})} placeholder="Demo URL (optional)" className={inputClass} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={newProject.featured} onChange={(e) => setNewProject({...newProject, featured: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="featured" className="text-text-primary">Featured project</label>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">Create Project</button>
                  <button type="button" onClick={() => setShowProjectForm(false)} className="px-6 py-3 bg-card border border-primary/20 text-text-muted rounded-lg">Cancel</button>
                </div>
              </form>
            )}
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-card rounded-xl p-6 border border-primary/10 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary">{project.title}</h3>
                      {project.featured && <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded">Featured</span>}
                    </div>
                    <p className="text-sm text-text-muted mt-1">{project.description}</p>
                    <div className="flex gap-2 mt-2">{project.technologies?.map((tag: string) => <span key={tag} className="px-2 py-1 text-xs bg-accent/10 text-accent rounded">{tag}</span>)}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/projects/${project.slug}`} target="_blank" className="p-2 text-text-muted hover:text-primary"><Eye className="w-5 h-5" /></Link>
                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Stats (Numbers Don't Lie)</h2>
              <button onClick={() => setShowStatForm(!showStatForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            </div>
            {showStatForm && (
              <form onSubmit={handleCreateStat} className="bg-card rounded-xl p-6 border border-primary/10 mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Add New Stat</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <select value={newStat.icon} onChange={(e) => setNewStat({...newStat, icon: e.target.value})} className={inputClass}>
                    <option value="Code">Code</option><option value="Users">Users</option><option value="Globe">Globe</option><option value="Coffee">Coffee</option>
                  </select>
                  <input type="number" value={newStat.value} onChange={(e) => setNewStat({...newStat, value: parseInt(e.target.value)})} placeholder="Value" required className={inputClass} />
                  <input type="text" value={newStat.suffix} onChange={(e) => setNewStat({...newStat, suffix: e.target.value})} placeholder="Suffix (e.g. +)" className={inputClass} />
                  <input type="text" value={newStat.label} onChange={(e) => setNewStat({...newStat, label: e.target.value})} placeholder="Label" required className={inputClass} />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">Add Stat</button>
                  <button type="button" onClick={() => setShowStatForm(false)} className="px-6 py-3 bg-card border border-primary/20 text-text-muted rounded-lg">Cancel</button>
                </div>
              </form>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-card rounded-xl p-6 border border-primary/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">{stat.icon === 'Code' ? '💻' : stat.icon === 'Users' ? '👥' : stat.icon === 'Globe' ? '🌍' : '☕'}</div>
                    <button onClick={() => handleDeleteStat(stat.id)} className="p-1 text-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}{stat.suffix}</p>
                  <input type="text" defaultValue={stat.label} onBlur={(e) => handleUpdateStat(stat.id, { label: e.target.value })} className="text-sm text-text-muted mt-1 bg-transparent border-none w-full focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Testimonials (What People Say)</h2>
              <button onClick={() => setShowTestimonialForm(!showTestimonialForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Testimonial
              </button>
            </div>
            {showTestimonialForm && (
              <form onSubmit={handleCreateTestimonial} className="bg-card rounded-xl p-6 border border-primary/10 mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Add New Testimonial</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <input type="text" value={newTestimonial.name} onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})} placeholder="Name" required className={inputClass} />
                  <input type="text" value={newTestimonial.role} onChange={(e) => setNewTestimonial({...newTestimonial, role: e.target.value})} placeholder="Role" className={inputClass} />
                  <input type="text" value={newTestimonial.company} onChange={(e) => setNewTestimonial({...newTestimonial, company: e.target.value})} placeholder="Company" className={inputClass} />
                </div>
                <textarea value={newTestimonial.content} onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})} placeholder="Testimonial content" required rows={3} className={`${inputClass} resize-none`} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="approved" checked={newTestimonial.approved} onChange={(e) => setNewTestimonial({...newTestimonial, approved: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="approved" className="text-text-primary">Approved for display</label>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">Add Testimonial</button>
                  <button type="button" onClick={() => setShowTestimonialForm(false)} className="px-6 py-3 bg-card border border-primary/20 text-text-muted rounded-lg">Cancel</button>
                </div>
              </form>
            )}
            <div className="space-y-4">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-card rounded-xl p-6 border border-primary/10 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-text-primary">{t.name}</span>
                      {t.approved ? <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded">Approved</span> : <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">Pending</span>}
                    </div>
                    <p className="text-sm text-text-muted">{t.role}{t.company && ` at ${t.company}`}</p>
                    <p className="text-sm text-text-secondary mt-2">"{t.content}"</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleUpdateTestimonial(t.id, { approved: !t.approved })} className={`px-3 py-1 text-xs rounded ${t.approved ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                        {t.approved ? 'Unapprove' : 'Approve'}
                      </button>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Timeline (My Journey)</h2>
              <button onClick={() => setShowTimelineForm(!showTimelineForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Event
              </button>
            </div>
            {showTimelineForm && (
              <form onSubmit={handleCreateTimeline} className="bg-card rounded-xl p-6 border border-primary/10 mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Add Timeline Event</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <select value={newTimeline.icon} onChange={(e) => setNewTimeline({...newTimeline, icon: e.target.value})} className={inputClass}>
                    <option value="GraduationCap">GraduationCap</option><option value="Code">Code</option><option value="Rocket">Rocket</option><option value="Briefcase">Briefcase</option><option value="Heart">Heart</option>
                  </select>
                  <input type="text" value={newTimeline.event_date} onChange={(e) => setNewTimeline({...newTimeline, event_date: e.target.value})} placeholder="Date (e.g. 2025)" required className={inputClass} />
                </div>
                <input type="text" value={newTimeline.title} onChange={(e) => setNewTimeline({...newTimeline, title: e.target.value})} placeholder="Title" required className={inputClass} />
                <textarea value={newTimeline.description} onChange={(e) => setNewTimeline({...newTimeline, description: e.target.value})} placeholder="Description" rows={2} className={`${inputClass} resize-none`} />
                <div className="flex gap-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">Add Event</button>
                  <button type="button" onClick={() => setShowTimelineForm(false)} className="px-6 py-3 bg-card border border-primary/20 text-text-muted rounded-lg">Cancel</button>
                </div>
              </form>
            )}
            <div className="space-y-4">
              {timelineEvents.map((event) => (
                <div key={event.id} className="bg-card rounded-xl p-6 border border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">{event.icon === 'GraduationCap' ? '🎓' : event.icon === 'Code' ? '💻' : event.icon === 'Rocket' ? '🚀' : event.icon === 'Briefcase' ? '💼' : '❤️'}</div>
                    <div>
                      <span className="text-xs text-accent font-medium">{event.event_date}</span>
                      <h3 className="font-semibold text-text-primary">{event.title}</h3>
                      <p className="text-sm text-text-muted">{event.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTimeline(event.id)} className="p-2 text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Feedback Inbox</h2>
              <p className="text-text-muted">{feedback.filter(f => !f.reviewed).length} unread</p>
            </div>
            <div className="space-y-4">
              {feedback.map((fb) => (
                <div key={fb.id} className={`bg-card rounded-xl p-6 border ${fb.reviewed ? 'border-primary/10' : 'border-yellow-500/30'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{fb.name}</span>
                        {fb.reviewed ? <Check className="w-4 h-4 text-green-500" /> : <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">New</span>}
                      </div>
                      <p className="text-sm text-text-muted">{fb.role}{fb.company && ` at ${fb.company}`}</p>
                      {fb.project && <p className="text-xs text-accent mt-1">Project: {fb.project}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-text-muted/30'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-text-secondary mb-4">"{fb.content}"</p>
                  <div className="flex gap-2">
                    {!fb.reviewed && (
                      <button onClick={() => handleConvertToTestimonial(fb)} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
                        Convert to Testimonial
                      </button>
                    )}
                    <button onClick={() => handleDeleteFeedback(fb.id)} className="px-4 py-2 bg-card border border-primary/20 text-text-muted text-sm rounded-lg hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {feedback.length === 0 && <div className="text-center py-12 text-text-muted">No feedback yet!</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
