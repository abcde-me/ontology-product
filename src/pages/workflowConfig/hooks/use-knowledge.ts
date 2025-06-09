import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export const useKnowledge = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const formatIndexingTechnique = useCallback((indexingTechnique: string) => {
    return t(`dataset.indexingTechnique.${indexingTechnique}`)
  }, [t])

  const formatIndexingMethod = useCallback((indexingMethod: string, isEco?: boolean) => {
    if (isEco)
      return t('dataset.indexingMethod.invertedIndex')

    return t(`dataset.indexingMethod.${indexingMethod}`)
  }, [t])

  const formatIndexingTechniqueAndMethod = useCallback((indexingTechnique: string, indexingMethod: string) => {
    let result = formatIndexingTechnique(indexingTechnique)

    if (indexingMethod)
      result += ` · ${formatIndexingMethod(indexingMethod, indexingTechnique === 'economy')}`

    return result
  }, [formatIndexingTechnique, formatIndexingMethod])

  return {
    formatIndexingTechnique,
    formatIndexingMethod,
    formatIndexingTechniqueAndMethod,
  }
}
