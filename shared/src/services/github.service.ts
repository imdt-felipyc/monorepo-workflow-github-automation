import jwt from 'jsonwebtoken'
import { env } from '../env.js'

export class GitHubService {
  private GITHUB_APP_ID: string
  private GITHUB_ORG: string
  private GITHUB_APP_PRIVATE_KEY_BASE64: string
  private GITHUB_USERNAME: string
  private GITHUB_REPO_NAME: string
  private token: string | null
  private tokenExpiresAt: number | null

  constructor() {
    const {
      GITHUB_APP_ID,
      GITHUB_ORG,
      GITHUB_APP_PRIVATE_KEY_BASE64,
      GITHUB_USERNAME,
      GITHUB_REPO_NAME,
    } = env

    this.GITHUB_APP_ID = GITHUB_APP_ID
    this.GITHUB_ORG = GITHUB_ORG
    this.GITHUB_APP_PRIVATE_KEY_BASE64 = GITHUB_APP_PRIVATE_KEY_BASE64
    this.GITHUB_USERNAME = GITHUB_USERNAME
    this.GITHUB_REPO_NAME = GITHUB_REPO_NAME

    this.token = null
    this.tokenExpiresAt = null
  }

  async getGitHubToken() {
    const now = Math.floor(Date.now() / 1000)

    if (this.token && this.tokenExpiresAt && now < this.tokenExpiresAt) {
      return this.token
    }

    const appId = this.GITHUB_APP_ID
    const privateKey = Buffer.from(
      this.GITHUB_APP_PRIVATE_KEY_BASE64,
      'base64',
    ).toString('utf8')

    const jwtToken = jwt.sign(
      {
        iat: now,
        exp: now + 600,
        iss: appId,
      },
      privateKey,
      { algorithm: 'RS256' },
    )

    const installationRes: any = await fetch(
      'https://api.github.com/app/installations',
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: 'application/vnd.github+json',
        },
      },
    )

    const installations = await installationRes.json()
    const installationId = installations.find(
      (inst: any) => inst.account?.login === this.GITHUB_ORG,
    )?.id

    if (!installationId) throw new Error('Installation not found')

    const tokenRes: any = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: 'application/vnd.github+json',
        },
      },
    )

    const tokenData = await tokenRes.json()
    this.token = tokenData.token
    this.tokenExpiresAt = now + 60 * 55
    return this.token
  }

  async githubGraphQL(query) {
    const token = await this.getGitHubToken()
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const data: any = await res.json()

    if (data.errors?.length) {
      const messages = data.errors.map((e: any) => e.message).join('; ')
      throw new Error(`GitHub GraphQL Error(s): ${messages}`)
    }

    return data.data
  }

  async getIssueDetails(issueNodeId: string) {
    const query = `
      query {
        node(id: "${issueNodeId}") {
          ... on Issue {
            id
            title
            number
            url
            projectItems(first: 10) {
              nodes {
                id
                updatedAt
                project {
                  id
                  title
                }
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field {
                        ... on ProjectV2SingleSelectField {
                          id
                          name
                          options {
                            id
                            name
                          }
                        }
                      }
                      optionId
                    }
                    ... on ProjectV2ItemFieldTextValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          id
                          name
                        }
                      }
                      text
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          id
                          name
                        }
                      }
                      number
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          id
                          name
                        }
                      }
                      date
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const result = await this.githubGraphQL(query)
    return result.node
  }

  async getProjectIds() {
    const query = `
      query {
        organization(login: "${this.GITHUB_ORG}") {
          projectsV2(first: 20) {
            nodes {
              id
              title
            }
          }
        }
      }
    `
    const data = await this.githubGraphQL(query)
    return data.organization.projectsV2.nodes
  }

  async replicateProjectItem(issueId, projectId) {
    const mutation = `
      mutation {
        addProjectV2ItemById(input: {
          contentId: "${issueId}",
          projectId: "${projectId}"
        }) {
          item { id }
        }
      }
    `
    const result = await this.githubGraphQL(mutation)

    return result.addProjectV2ItemById.item
  }

  async getRepositoryIssuesWithProjects(cursor = null) {
    const after = cursor ? `, after: "${cursor}"` : ''
    const query = `
      query {
        repository(owner: "${this.GITHUB_ORG}", name: "${this.GITHUB_REPO_NAME}") {
          issues(first: 100${after}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              title
              number
              url
              state
              createdAt
              updatedAt
              author {
                login
              }
              labels(first: 10) {
                nodes {
                  id
                  name
                  color
                }
              }
              projectItems(first: 10) {
                nodes {
                  id
                  project {
                    id
                    title
                  }
                  fieldValues(first: 20) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        field {
                          ... on ProjectV2SingleSelectField {
                            id
                            name
                            options {
                              id
                              name
                            }
                          }
                        }
                        optionId
                      }
                      ... on ProjectV2ItemFieldTextValue {
                        field {
                          ... on ProjectV2FieldCommon {
                            id
                            name
                          }
                        }
                        text
                      }
                      ... on ProjectV2ItemFieldNumberValue {
                        field {
                          ... on ProjectV2FieldCommon {
                            id
                            name
                          }
                        }
                        number
                      }
                      ... on ProjectV2ItemFieldDateValue {
                        field {
                          ... on ProjectV2FieldCommon {
                            id
                            name
                          }
                        }
                        date
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await this.githubGraphQL(query)
    const issues = data.repository.issues
    return {
      nodes: issues.nodes,
      pageInfo: issues.pageInfo,
    }
  }

  async getIssuesByProjectIds(projectIds, cursor = null) {
    const after = cursor ? `, after: "${cursor}"` : ''
    const query = `
      query {
        repository(owner: "${this.GITHUB_ORG}", name: "${this.GITHUB_REPO_NAME}") {
          issues(first: 50${after}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
            nodes { 
              id
              projectItems(first: 20) {
                nodes {
                  project {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await this.githubGraphQL(query)
    const issues = data.repository.issues

    // Filter issues that belong to the provided project IDs
    const filteredIssues = issues.nodes.filter((issue) =>
      issue.projectItems.nodes.some((item) =>
        projectIds.includes(item.project.id),
      ),
    )

    return {
      nodes: filteredIssues,
      pageInfo: issues.pageInfo,
    }
  }

  async setProjectFieldValue({
    contentId,
    projectId,
    fieldId,
    optionId,
    number,
    text,
    date,
  }: {
    contentId?: any
    projectId?: any
    fieldId?: any
    optionId?: any
    number?: any
    text?: any
    date?: any
  }) {
    let value = ''

    if (optionId !== undefined) {
      value =
        optionId === null
          ? 'singleSelectOptionId: null'
          : `singleSelectOptionId: "${optionId}"`
    } else if (number !== undefined) {
      value = number === null ? 'number: null' : `number: ${number}`
    } else if (typeof text !== 'undefined') {
      value = text === null ? 'text: null' : `text: """${text}"""`
    } else if (typeof date !== 'undefined') {
      value = date === null ? 'date: null' : `date: "${date}"`
    }

    const mutation = `
      mutation {
        updateProjectV2ItemFieldValue(input: {
          projectId: "${projectId}",
          itemId: "${contentId}",
          fieldId: "${fieldId}",
          value: {
            ${value}
          }
        }) {
          projectV2Item {
            id
          }
        }
      }
    `
    await this.githubGraphQL(mutation)
  }

  async getProjectFields(projectId) {
    const query = `
      query {
        node(id: "${projectId}") {
          ... on ProjectV2 {
            fields(first: 50) {
              nodes {
                __typename
                ... on ProjectV2FieldCommon {
                  id
                  name
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `
    const result = await this.githubGraphQL(query)
    return result.node.fields.nodes
  }
}
