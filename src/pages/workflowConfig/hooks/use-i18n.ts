
export const renderI18nObject = (obj: Record<string, string>, language: string) => {
  if (!obj) return ''
  if (obj?.[language]) return obj[language]
  if (obj?.en_US) return obj.en_US
  return Object.values(obj)[0]
}

export const useRenderI18nObject = () => {
  // const language = useLanguage()
  const language = 'zh_Hans'
  return (obj: Record<string, string>) => {
    return renderI18nObject(obj, language)
  }
}
