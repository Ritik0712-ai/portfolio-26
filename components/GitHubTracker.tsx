'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, GitFork, ExternalLink, Users, BookOpen, Activity } from 'lucide-react'

interface GitHubData {
  profile: {
    name: string
    bio: string
    avatar: string
    htmlUrl: string
    followers: number
    following: number
    publicRepos: number
  }
  repositories: {
    id: number
    name: string
    description: string
    htmlUrl: string
    stars: number
    forks: number
    language: string
  }[]
  contributionCount: number
}

export default function GitHubTracker() {
  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/github')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setData(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load GitHub data')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 text-text-muted">
        Unable to load GitHub data. Please check back later.
      </div>
    )
  }

  const stats = [
    { label: 'Repositories', value: data.profile.publicRepos, icon: BookOpen },
    { label: 'Followers', value: data.profile.followers, icon: Users },
    { label: 'Following', value: data.profile.following, icon: Users },
    { label: 'Contributions', value: data.contributionCount, icon: Activity },
  ]

  const languageColors: Record<string, string> = {
    JavaScript: '#F7DF1E',
    TypeScript: '#3178C6',
    Python: '#3572A5',
    Java: '#B07219',
    'C++': '#F34B7D',
    Go: '#00ADD8',
    Rust: '#DEA584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-primary/10"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <a href={data.profile.htmlUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={data.profile.avatar}
              alt={data.profile.name || 'GitHub Profile'}
              className="w-24 h-24 rounded-full border-2 border-primary/20 hover:border-primary transition-colors"
            />
          </a>

          {/* Profile Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-text-primary">
              {data.profile.name || 'Ritik Agarwal'}
            </h3>
            <p className="text-text-muted mt-1">{data.profile.bio || 'CS Student | Building Products'}</p>
            <a
              href={data.profile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-primary hover:text-accent transition-colors"
            >
              @{data.profile.htmlUrl.split('/').pop()}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-bg-primary rounded-lg p-4 text-center"
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Repositories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Top Repositories</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {data.repositories.slice(0, 6).map((repo) => (
            <motion.a
              key={repo.id}
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-5 border border-primary/10 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate flex-1">
                  {repo.name}
                </h4>
                <ExternalLink className="w-4 h-4 text-text-muted flex-shrink-0 ml-2" />
              </div>
              
              <p className="text-sm text-text-muted line-clamp-2 mb-4">
                {repo.description || 'No description available'}
              </p>

              <div className="flex items-center gap-4 text-xs text-text-muted">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: languageColors[repo.language] || '#6e7681' }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {repo.forks}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Contribution Graph Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-6 border border-primary/10"
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Contribution Activity</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Less</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1].map((opacity) => (
                <div
                  key={opacity}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: `rgba(88, 166, 255, ${opacity})` }}
                />
              ))}
            </div>
            <span className="text-xs text-text-muted">More</span>
          </div>
        </div>
        <div className="text-center py-8 text-text-muted">
          <Activity className="w-12 h-12 mx-auto mb-2 text-primary/50" />
          <p>{data.contributionCount}+ contributions in the last year</p>
          <a
            href={data.profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-primary hover:text-accent transition-colors text-sm"
          >
            View full contribution history
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
