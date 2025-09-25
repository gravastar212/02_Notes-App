import apiClient from '@/lib/api'

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    defaults: {
      baseURL: 'http://localhost:4000',
      headers: {
        common: {},
      },
    },
  })),
  post: jest.fn(),
}))

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(apiClient).toBeDefined()
  })

  it('should have required methods', () => {
    expect(apiClient.get).toBeDefined()
    expect(apiClient.post).toBeDefined()
    expect(apiClient.put).toBeDefined()
    expect(apiClient.delete).toBeDefined()
    expect(apiClient.login).toBeDefined()
    expect(apiClient.register).toBeDefined()
    expect(apiClient.logout).toBeDefined()
  })

  it('should have correct method types', () => {
    expect(typeof apiClient.get).toBe('function')
    expect(typeof apiClient.post).toBe('function')
    expect(typeof apiClient.put).toBe('function')
    expect(typeof apiClient.delete).toBe('function')
    expect(typeof apiClient.login).toBe('function')
    expect(typeof apiClient.register).toBe('function')
    expect(typeof apiClient.logout).toBe('function')
  })
})
