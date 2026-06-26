import fs from 'fs'
import path from 'path'

import { GLAD } from '../lib/glad.js'
import { Constants } from '../lib/models/constants.js'

describe('TypeScript Dependency Detection', function () {
  it('should detect TypeScript import/export and type dependencies correctly', function () {
    const outputFilePath = 'test/results/test_output_ts.svg'

    const glad = new GLAD({
      edges: Constants.EDGES_BOTH,
      exclude: '**/*test*.js',
      input: '.',
      lineEffect: 'flat',
      output: outputFilePath,
      silent: true
    })

    // Create test TypeScript files
    const tsFiles = [
      {
        content: `
export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}
`,
        name: 'types.ts'
      },
      {
        content: `
import { User, UserRole, ApiResponse } from './types.js'

export class UserService {
  private users: User[] = []

  async createUser(name: string, email: string, role: UserRole = 'user'): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36),
      name,
      email,
      createdAt: new Date()
    }

    this.users.push(newUser)
    return newUser
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return {
      data: this.users,
      success: true
    }
  }

  findUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id)
  }
}
`,
        name: 'userService.ts'
      },
      {
        content: `
import React, { useState, useEffect } from 'react'
import { User, UserRole } from './types.js'
import { UserService } from './userService.js'

interface UserComponentProps {
  initialRole?: UserRole
}

export const UserComponent: React.FC<UserComponentProps> = ({ initialRole = 'user' }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const userService = new UserService()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await userService.getUsers()
      if (response.success) {
        setUsers(response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    const newUser = await userService.createUser('John Doe', 'john@example.com', initialRole)
    setUsers(prev => [...prev, newUser])
  }

  return (
    <div>
      <h1>User Management</h1>
      <button onClick={createUser} disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      <UserList users={users} />
    </div>
  )
}

interface UserListProps {
  users: User[]
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} ({user.email}) - Role: {user.role || 'user'}
        </li>
      ))}
    </ul>
  )
}
`,
        name: 'UserComponent.tsx'
      },
      {
        content: `
import React from 'react'
import { UserComponent } from './UserComponent.js'
import { UserService } from './userService.js'
import { User, ApiResponse } from './types.js'

const App: React.FC = () => {
  const userService = new UserService()

  const handleUserCreated = async (user: User) => {
    console.log('User created:', user)
  }

  return (
    <div className="App">
      <header>
        <h1>TypeScript User App</h1>
      </header>
      <main>
        <UserComponent initialRole="admin" />
      </main>
    </div>
  )
}

export default App
`,
        name: 'App.tsx'
      }
    ]

    // Write test files
    const testDir = 'test_ts_integration'
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir)
    }

    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath)
    }

    const filePaths = []
    tsFiles.forEach(file => {
      const filePath = path.join(testDir, file.name)
      fs.writeFileSync(filePath, file.content)
      filePaths.push(filePath)
    })

    try {
      // Process TypeScript files
      glad.jsTsParser.generateDependenciesFromSourceFiles()
      const graphWasProcessed = glad.context.processTheGraph()
      if (!graphWasProcessed) {
        throw new Error('Graph should be processed successfully')
      }

      if (!fs.existsSync(outputFilePath)) {
        throw new Error('SVG output should be generated')
      }

      // Verify dependencies were created correctly
      const dependencies = glad.allFileImports

      // Expected dependencies:
      // userService.ts -> types.ts (imports User, UserRole, ApiResponse)
      // UserComponent.tsx -> types.ts (imports User, UserRole)
      // UserComponent.tsx -> userService.ts (imports UserService)
      // App.tsx -> UserComponent.tsx (imports UserComponent)
      // App.tsx -> userService.ts (imports UserService)
      // App.tsx -> types.ts (imports User, ApiResponse)

      const userServiceToTypes = dependencies.filter(dep =>
        dep.source.includes('userService') && dep.target.includes('types')
      )
      const userComponentToTypes = dependencies.filter(dep =>
        dep.source.includes('UserComponent') && dep.target.includes('types')
      )
      const userComponentToUserService = dependencies.filter(dep =>
        dep.source.includes('UserComponent') && dep.target.includes('userService')
      )
      const appToUserComponent = dependencies.filter(dep =>
        dep.source.includes('App') && dep.target.includes('UserComponent')
      )
      const appToUserService = dependencies.filter(dep =>
        dep.source.includes('App') && dep.target.includes('userService')
      )
      const appToTypes = dependencies.filter(dep =>
        dep.source.includes('App') && dep.target.includes('types')
      )

      // Should have all expected dependencies
      if (userServiceToTypes.length === 0) {
        throw new Error('UserService should depend on types')
      }
      if (userComponentToTypes.length === 0) {
        throw new Error('UserComponent should depend on types')
      }
      if (userComponentToUserService.length === 0) {
        throw new Error('UserComponent should depend on userService')
      }
      if (appToUserComponent.length === 0) {
        throw new Error('App should depend on UserComponent')
      }
      if (appToUserService.length === 0) {
        throw new Error('App should depend on userService')
      }
      if (appToTypes.length === 0) {
        throw new Error('App should depend on types')
      }
    } finally {
      // Clean up test files
      tsFiles.forEach(file => {
        const filePath = path.join(testDir, file.name)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir)
      }
    }
  })
})
