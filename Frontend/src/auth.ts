export function isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }
  export function saveToken(token: string) {
    localStorage.setItem('token', token)
  }
  export function logout() {
    localStorage.removeItem('token')
  }