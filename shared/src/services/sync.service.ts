import { GitHubService } from './github.service.js'

interface Issue {
  id: string
  title: string
  number: number
  url: string
  projectItems: {
    nodes: {
      id: string
      updatedAt: string
      project: {
        id: string
        title: string
      }
      fieldValues: {
        nodes: (
          | {
              field: {
                id: string
                name: string
                options?: { id: string; name: string }[]
              }
              optionId: string
            }
          | {
              field: {
                id: string
                name: string
              }
              text: string
            }
          | {
              field: {
                id: string
                name: string
              }
              number: number
            }
          | {
              field: {
                id: string
                name: string
              }
              date: string
            }
        )[]
      }
    }[]
  }
}

export async function SyncService(issueId: any, webhookSourceProjectId = null) {
  const OVERVIEW_PROJECT_NAME = '🚁 Overview'
  const githubService = new GitHubService()

  const organizationProjects = await githubService.getProjectIds()

  const overviewProject = organizationProjects.find(
    (p) => p.title === OVERVIEW_PROJECT_NAME,
  )
  if (!overviewProject) throw new Error('Overview project not found')

  const issue: Issue = await githubService.getIssueDetails(issueId)
  if (!issue) throw new Error('Issue not found')

  const issueProjects = issue.projectItems.nodes

  const hasSyncProject = issueProjects.some((p) =>
    p.project?.title?.includes('[SYNC]'),
  )
  if (!hasSyncProject) {
    console.log(
      `🔕 Skipping sync: issue '${issue.title}' is not associated with any [SYNC] project.`,
    )
    return `🔕 Skipped: issue '${issue.title}' has no [SYNC] project.`
  }

  let overviewItem = issueProjects.find(
    (p) => p.project.id === overviewProject.id,
  )

  if (!overviewItem) {
    const newItem = await githubService.replicateProjectItem(
      issue.id,
      overviewProject.id,
    )
    overviewItem = {
      id: newItem.id,
      project: overviewProject,
      fieldValues: { nodes: [] },
      updatedAt: new Date().toISOString(),
    }
    issueProjects.push(overviewItem)
    console.log(`✔️ Issue '${issue.title}' added to the Overview project.`)
  } else {
    console.log(`ℹ️ Issue is already in the Overview project.`)
  }

  let sourceProjectItem = null

  // 1. Try using the project that triggered the webhook
  if (webhookSourceProjectId) {
    const candidate = issueProjects.find(
      (p) => p.project.id === webhookSourceProjectId,
    )
    if (hasRelevantFields(candidate)) {
      sourceProjectItem = candidate
      console.log(
        `📦 Webhook project (${candidate?.project.title}) will be used as the source.`,
      )
    } else {
      console.log(
        `ℹ️ Webhook project (${webhookSourceProjectId}) does not have relevant fields.`,
      )
    }
  }

  // 2. If not found, try another project (except the Overview)
  if (!sourceProjectItem) {
    const candidates = issueProjects
      .filter(
        (p) => p.project.id !== overviewProject.id && hasRelevantFields(p),
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )

    if (candidates.length > 0) {
      sourceProjectItem = candidates[0]
      console.log(
        `📦 Alternative project (${sourceProjectItem.project.title}) will be used as the source.`,
      )
    }
  }

  // 3. Final fallback: use Overview if it has valid fields
  if (!sourceProjectItem) {
    const overviewCandidate = issueProjects.find(
      (p) => p.project.id === overviewProject.id && hasRelevantFields(p),
    )
    if (overviewCandidate) {
      sourceProjectItem = overviewCandidate
      console.log(`📦 Overview will be used as a fallback.`)
    }
  }

  // 4. If still not found, terminate
  if (!sourceProjectItem || !sourceProjectItem?.fieldValues?.nodes?.length) {
    console.warn(
      `⚠️ No project with populated fields for issue '${issue.title}'. Synchronization skipped.`,
    )
    return `⚠️ No project with populated fields for issue '${issue.title}'. Synchronization skipped.`
  }

  const sourceFields = sourceProjectItem.fieldValues.nodes
  const sourceFieldsMap = new Map(
    sourceFields
      .map((fv) => [fv.field?.name?.toLowerCase(), fv])
      .filter(([name]) => name && name !== 'title'),
  )

  for (const targetItem of issueProjects) {
    if (targetItem.id === sourceProjectItem.id) continue

    const targetProjectId = targetItem.project.id
    const targetProjectFields = await githubService.getProjectFields(
      targetProjectId,
    )
    const targetFieldsMap = new Map(
      (targetItem.fieldValues?.nodes || []).map((fv) => [
        fv.field?.name?.toLowerCase(),
        fv,
      ]),
    )

    for (const targetField of targetProjectFields) {
      const fieldName = targetField.name?.toLowerCase()
      if (!fieldName || fieldName === 'title') continue

      const contentId = targetItem.id
      const args = {
        contentId,
        projectId: targetProjectId,
        fieldId: targetField.id,
      }

      const sourceField: any = sourceFieldsMap.get(fieldName)

      if (sourceField) {
        if ('optionId' in sourceField && targetField.options) {
          const matchingOption = targetField.options.find(
            (o) => o.name === getOptionName(sourceField),
          )
          if (matchingOption) {
            await githubService.setProjectFieldValue({
              ...args,
              optionId: matchingOption.id,
            })
            console.log(
              `🔁 Field "${targetField.name}" replicated (select) in project "${targetItem.project.title}".`,
            )
          }
        } else if ('number' in sourceField) {
          await githubService.setProjectFieldValue({
            ...args,
            number: sourceField.number,
          })
          console.log(
            `🔁 Field "${targetField.name}" replicated (number) in project "${targetItem.project.title}".`,
          )
        } else if ('text' in sourceField) {
          await githubService.setProjectFieldValue({
            ...args,
            text: sourceField.text,
          })
          console.log(
            `🔁 Field "${targetField.name}" replicated (text) in project "${targetItem.project.title}".`,
          )
        } else if ('date' in sourceField) {
          await githubService.setProjectFieldValue({
            ...args,
            date: sourceField.date,
          })
          console.log(
            `🔁 Field "${targetField.name}" replicated (date) in project "${targetItem.project.title}".`,
          )
        }
      } else if (targetFieldsMap.has(fieldName)) {
        const current = targetFieldsMap.get(fieldName)
        if ('optionId' in current) {
          await githubService.setProjectFieldValue({ ...args, optionId: null })
          console.log(
            `🧹 Field "${targetField.name}" cleared (select) in project "${targetItem.project.title}".`,
          )
        } else if ('number' in current) {
          await githubService.setProjectFieldValue({ ...args, number: null })
          console.log(
            `🧹 Field "${targetField.name}" cleared (number) in project "${targetItem.project.title}".`,
          )
        } else if ('text' in current) {
          await githubService.setProjectFieldValue({ ...args, text: null })
          console.log(
            `🧹 Field "${targetField.name}" cleared (text) in project "${targetItem.project.title}".`,
          )
        } else if ('date' in current) {
          await githubService.setProjectFieldValue({ ...args, date: null })
          console.log(
            `🧹 Field "${targetField.name}" cleared (date) in project "${targetItem.project.title}".`,
          )
        }
      }
    }
  }

  return '✔️ Issue synced across projects.'
}

function getOptionName(fieldValue) {
  return fieldValue?.field?.options?.find((o) => o.id === fieldValue.optionId)
    ?.name
}

function hasRelevantFields(projectItem) {
  if (!projectItem?.fieldValues?.nodes?.length) return false

  return projectItem.fieldValues.nodes.some((field) => {
    const name = field?.field?.name?.toLowerCase()
    if (!name || name === 'title') return false

    return (
      'optionId' in field ||
      'text' in field ||
      'number' in field ||
      'date' in field
    )
  })
}
