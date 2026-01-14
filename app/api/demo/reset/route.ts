import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const OWNER = 'govambam'
const REPO = 'flowmetrics-demo'
const DEMO_BRANCH = 'demo-bugs'

export async function POST() {
  const logs: string[] = []
  const log = (message: string) => {
    console.log(message)
    logs.push(message)
  }

  try {
    // Check for GitHub token
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return NextResponse.json({
        success: false,
        output: 'Error: GITHUB_TOKEN environment variable is not set',
        error: 'Missing GitHub token',
      })
    }

    log('🧹 Resetting demo environment...')
    log('')

    const octokit = new Octokit({ auth: token })

    // Step 1: Find and close any open PRs from demo-bugs branch
    log('Looking for open PRs from demo-bugs branch...')
    const { data: openPRs } = await octokit.pulls.list({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      head: `${OWNER}:${DEMO_BRANCH}`,
    })

    if (openPRs.length > 0) {
      log(`Found ${openPRs.length} open PR(s) to close`)
      for (const pr of openPRs) {
        log(`  Closing PR #${pr.number}: ${pr.title}`)
        await octokit.pulls.update({
          owner: OWNER,
          repo: REPO,
          pull_number: pr.number,
          state: 'closed',
        })
        log(`  ✓ PR #${pr.number} closed`)
      }
    } else {
      log('No open PRs found from demo-bugs branch')
    }

    // Step 2: Delete the demo-bugs branch if it exists
    log('')
    log('Checking for demo-bugs branch...')
    try {
      await octokit.git.getRef({
        owner: OWNER,
        repo: REPO,
        ref: `heads/${DEMO_BRANCH}`,
      })
      // Branch exists, delete it
      log('Deleting demo-bugs branch...')
      await octokit.git.deleteRef({
        owner: OWNER,
        repo: REPO,
        ref: `heads/${DEMO_BRANCH}`,
      })
      log('✓ Branch deleted')
    } catch (error: any) {
      if (error.status === 404) {
        log('No demo-bugs branch found (already deleted or never created)')
      } else {
        throw error
      }
    }

    log('')
    log('════════════════════════════════════════════════════════════════')
    log('✓ Demo reset complete!')
    log('════════════════════════════════════════════════════════════════')
    log('')
    log('Ready to create a fresh demo PR.')

    return NextResponse.json({
      success: true,
      output: logs.join('\n'),
    })
  } catch (error: any) {
    log('')
    log(`❌ Error: ${error.message}`)

    // Add more detailed error info for debugging
    if (error.response) {
      log(`Status: ${error.response.status}`)
      log(`Details: ${JSON.stringify(error.response.data, null, 2)}`)
    }

    return NextResponse.json({
      success: false,
      output: logs.join('\n'),
      error: error.message,
    })
  }
}
