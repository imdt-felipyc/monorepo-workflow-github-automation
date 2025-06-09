import {
  GitHubService,
  SyncService,
  saveLogPage,
  notifySlack,
} from '@repo/shared'

export async function batchSyncIssues() {
  const githubService = new GitHubService()

  let cursor = null
  let hasNextPage = true
  let page = 1
  let counter = 0

  try {
    const allProjects = await githubService.getProjectIds()
    const projectIds = allProjects
      .filter((project) => project.title.includes('[SYNC]'))
      .map((project) => project.id)

    if (projectIds.length === 0) {
      throw new Error('No projects found with the "[SYNC]" tag.')
    }

    while (hasNextPage) {
      const { nodes: issues, pageInfo } =
        await githubService.getIssuesByProjectIds(projectIds, cursor)
      const logLines = []

      for (const issue of issues) {
        const issueId = issue.id
        await SyncService(issueId)
        logLines.push(`OK    ${issueId}`)
        counter++
      }

      if (!pageInfo.hasNextPage) {
        logLines.push('---')
        logLines.push(`✔️ Done. Total: ${counter} issues processed.`)
      }

      await saveLogPage(logLines, page, 'github-batch-sync')

      cursor = pageInfo.endCursor
      hasNextPage = pageInfo.hasNextPage
      page++
    }

    await notifySlack(
      `✔️ Batch sync completed successfully. Total issues processed: ${counter}.`,
    )

    console.log(`✔️ ${counter} issues processed.`)

    return {
      statusCode: 200,
      body: {
        message: 'Batch sync completed',
        issuesProcessed: counter,
      },
    }
  } catch (error) {
    console.error('❌ General error in batch sync:', error)

    const logLines: string[] = []
    logLines.push('---')
    logLines.push(`❌ Execution failed unexpectedly.`)
    logLines.push(`Error: ${error.message}`)
    logLines.push(`Stack: ${error.stack?.split('\n')[0]}`)

    await saveLogPage(logLines, page, 'github-batch-sync')
    await notifySlack(
      `❌ Batch sync failed unexpectedly. Error: ${error.message}`,
    )

    return {
      statusCode: 500,
      body: {
        message: 'Error in batch synchronization',
        error: error.message,
      },
    }
  }
}

export const main = batchSyncIssues
