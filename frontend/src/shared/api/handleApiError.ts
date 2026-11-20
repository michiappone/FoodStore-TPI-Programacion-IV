import axios from 'axios'

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (data !== null && typeof data === 'object' && 'detail' in data) {
      const detail = data.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((issue: unknown) => {
        if (typeof issue === 'object' && issue !== null && 'msg' in issue) return String(issue.msg)
        return 'Dato inválido'
      }).join('; ')
    }
    if (!error.response) return 'No se pudo conectar al servidor. Verificá que el backend esté ejecutándose.'
    return `Error HTTP ${error.response.status}`
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}
