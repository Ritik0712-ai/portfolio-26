import { NextResponse } from 'next/server'

const GITHUB_USERNAME = 'Ritik0712-ai'

export async function GET() {
  try {
    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: { 'User-Agent': 'Portfolio' },
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!userRes.ok) {
      throw new Error('Failed to fetch GitHub data')
    }
    
    const userData = await userRes.json()

    // Fetch repositories (sorted by stars)
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&per_page=6`,
      {
        headers: { 'User-Agent': 'Portfolio' },
        next: { revalidate: 3600 }
      }
    )
    const repos = await reposRes.json()

    // Fetch contribution data using GitHub GraphQL API
    // Since we can't use GraphQL without auth, we'll use the public events endpoint
    const eventsRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`,
      {
        headers: { 'User-Agent': 'Portfolio' },
        next: { revalidate: 3600 }
      }
    )
    const events = await eventsRes.ok ? await eventsRes.json() : []

    return NextResponse.json({
      profile: {
        name: userData.name,
        bio: userData.bio,
        avatar: userData.avatar_url,
        htmlUrl: userData.html_url,
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos,
        company: userData.company,
        location: userData.location,
        blog: userData.blog,
      },
      repositories: repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics,
      })),
      contributionCount: events.filter((e: any) => e.type === 'PushEvent').length,
    })
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}
