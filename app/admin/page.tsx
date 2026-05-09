'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, LayoutDashboard, FileText, FolderKanban, Mail, LogOut, Plus, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

type Tab = 'dashboard' | 'blogs' | 'projects'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [blogs, setBlogs] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)

  const [newBlog, setNewBlog] = useState({
    title: '', excerpt: '', content: '', tags: '', category: 'Tech', readingTime: '5 min read',
  })

  const [newProject, setNewProject] = useState({
    title: '', description: '', longDescription: '', tags: '', github: '', demo: '', featured: false,
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
      const [blogsRes, projectsRes] = await Promise.all([
        fetch('/api/admin/blogs'),
        fetch('/api/admin/projects'),
      ])
      setBlogs((await blogsRes.json()).blogs || [])
      setProjects((await projectsRes.json()).projects || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  const createSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    const blog = {
      id: Date.now().toString(),
      slug: createSlug(newBlog.title),
      ...newBlog,
      tags: newBlog.tags.split(',').map(t => t.trim()),
      date: new Date().toISOString().split('T')[0],
    }
    await fetch('/api/admin/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blog) })
    setBlogs([blog, ...blogs])
    setShowBlogForm(false)
    setNewBlog({ title: '', excerpt: '', content: '', tags: '', category: 'Tech', readingTime: '5 min read' })
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog?')) return
    await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' })
    setBlogs(blogs.filter(b => b.id !== id))
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const project = {
      id: Date.now().toString(),
      slug: createSlug(newProject.title),
      ...newProject,
      tags: newProject.tags.split(',').map(t => t.trim()),
    }
    await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) })
    setProjects([project, ...projects])
    setShowProjectForm(false)
    setNewProject({ title: '', description: '', longDescription: '', tags: '', github: '', demo: '', featured: false })
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' })
    setProjects(projects.filter(p => p.id !== id))
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

        <div className="flex gap-2 mb-8">
          {[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'blogs', label: 'Blogs', icon: FileText }, { id: 'projects', label: 'Projects', icon: FolderKanban }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-card text-text-muted hover:text-primary'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div>
                <div><p className="text-3xl font-bold text-text-primary">{blogs.length}</p><p className="text-text-muted">Blog Posts</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center"><FolderKanban className="w-6 h-6 text-accent" /></div>
                <div><p className="text-3xl font-bold text-text-primary">{projects.length}</p><p className="text-text-muted">Projects</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center"><Mail className="w-6 h-6 text-green-500" /></div>
                <div><p className="text-3xl font-bold text-text-primary">0</p><p className="text-text-muted">Messages</p></div>
              </div>
            </div>
          </div>
        )}

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
                  <input type="text" value={newBlog.readingTime} onChange={(e) => setNewBlog({...newBlog, readingTime: e.target.value})} placeholder="Reading time" className={inputClass} />
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
                    <Link href={`/blog/${blog.slug}`} className="p-2 text-text-muted hover:text-primary"><Eye className="w-5 h-5" /></Link>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {blogs.length === 0 && <div className="text-center py-12 text-text-muted">No blog posts yet. Create your first one!</div>}
            </div>
          </div>
        )}

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
                <textarea value={newProject.longDescription} onChange={(e) => setNewProject({...newProject, longDescription: e.target.value})} placeholder="Long description" required rows={4} className={`${inputClass} resize-none`} />
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" value={newProject.tags} onChange={(e) => setNewProject({...newProject, tags: e.target.value})} placeholder="Tags (comma separated)" className={inputClass} />
                  <input type="text" value={newProject.github} onChange={(e) => setNewProject({...newProject, github: e.target.value})} placeholder="GitHub URL" className={inputClass} />
                </div>
                <input type="text" value={newProject.demo} onChange={(e) => setNewProject({...newProject, demo: e.target.value})} placeholder="Demo URL (optional)" className={inputClass} />
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
                    <div className="flex gap-2 mt-2">{project.tags?.map((tag: string) => <span key={tag} className="px-2 py-1 text-xs bg-accent/10 text-accent rounded">{tag}</span>)}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/projects/${project.slug}`} className="p-2 text-text-muted hover:text-primary"><Eye className="w-5 h-5" /></Link>
                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <div className="text-center py-12 text-text-muted">No projects yet. Create your first one!</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
