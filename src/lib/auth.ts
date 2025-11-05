import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'

export interface User {
  _id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  university: string
  department?: string
  studentId?: string
  employeeId?: string
  isVerified: boolean
}

export const useAuth = (requiredRole?: string | string[]) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Memoize the allowed roles to prevent unnecessary re-renders
  const allowedRoles = useMemo(() => {
    if (!requiredRole) return null
    return Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  }, [requiredRole])

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData) as User
      
      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(parsedUser.role)) {
        router.push('/dashboard')
        return
      }

      setUser(parsedUser)
    } catch (error) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router]) // Remove role dependency - it's checked but doesn't need to trigger re-run

  const logout = async () => {
    try {
      // Call logout API to clear HTTP-only cookie
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Include cookies in request
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear localStorage regardless of API call result
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  return { user, loading, logout }
}

export const checkPermission = (userRole: string, action: string, resource: string): boolean => {
  const permissions: Record<string, Record<string, string[]>> = {
    admin: {
      students: ['read', 'create', 'update', 'delete'],
      teachers: ['read', 'create', 'update', 'delete'],
      classes: ['read', 'create', 'update', 'delete'],
      calendar: ['read', 'create', 'update', 'delete'],
      onlineClasses: ['read', 'create', 'update', 'delete']
    },
    teacher: {
      students: ['read'],
      classes: ['read', 'update'], // Can only update their own classes
      calendar: ['read'],
      onlineClasses: ['read', 'create', 'update'], // Can manage their own classes
      ownClasses: ['read', 'create', 'update', 'delete'] // Their own classes
    },
    student: {
      classes: ['read'],
      calendar: ['read'],
      onlineClasses: ['read'],
      ownProfile: ['read', 'update']
    }
  }

  const userPermissions = permissions[userRole]
  if (!userPermissions) return false

  const resourcePermissions = userPermissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}