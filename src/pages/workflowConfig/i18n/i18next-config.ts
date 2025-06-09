import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LanguagesSupported } from '@/pages/workflowConfig/i18n/language'
import commonTexts from './zh-Hans/common'
import layoutTexts from './zh-Hans/layout'
import loginTexts from './zh-Hans/login'
import registryTexts from './zh-Hans/register'
import appTexts from './zh-Hans/app'
import appOverviewTexts from './zh-Hans/app-overview'
import appDebugTexts from './zh-Hans/app-debug'
import appApiTexts from './zh-Hans/app-api'
import appLogTexts from './zh-Hans/app-log'
import appAnnotationTexts from './zh-Hans/app-annotation'
import shareTexts from './zh-Hans/share-app'
import datasetTexts from './zh-Hans/dataset'
import datasetDocumentsTexts from './zh-Hans/dataset-documents'
import datasetHitTestingTexts from './zh-Hans/dataset-hit-testing'
import datasetSettingsTexts from './zh-Hans/dataset-settings'
import datasetCreationTexts from './zh-Hans/dataset-creation'
import exploreTexts from './zh-Hans/explore'
import billingTexts from './zh-Hans/billing'
import customTexts from './zh-Hans/custom'
import toolsTexts from './zh-Hans/tools'
import workflowTexts from './zh-Hans/workflow'
import runLogTexts from './zh-Hans/run-log'
import pluginTexts from './zh-Hans/plugin'
import pluginTagsTexts from './zh-Hans/plugin-tags'
import timeTexts from './zh-Hans/time'
import { get } from 'lodash-es'


const loadLangResources = (lang: string) => ({
  translation: {
    common: commonTexts,
    layout: layoutTexts,
    login: loginTexts,
    register: registryTexts,
    app: appTexts,
    appOverview: appOverviewTexts,
    appDebug: appDebugTexts,
    appApi: appApiTexts,
    appLog: appLogTexts,
    appAnnotation: appAnnotationTexts,
    share: shareTexts,
    dataset: datasetTexts,
    datasetDocuments: datasetDocumentsTexts,
    datasetHitTesting: datasetHitTestingTexts,
    datasetSettings: datasetSettingsTexts,
    datasetCreation: datasetCreationTexts,
    explore: exploreTexts,
    billing: billingTexts,
    custom: customTexts,
    tools: toolsTexts,
    workflow: workflowTexts,
    runLog: runLogTexts,
    plugin: pluginTexts,
    pluginTags: pluginTagsTexts,
    time: timeTexts,
  },
})

// Automatically generate the resources object
const resources = LanguagesSupported.reduce((acc: any, lang: string) => {
  acc[lang] = loadLangResources(lang)
  return acc
}, {})



// const translation = {
//   common: commonTexts,
//   layout: layoutTexts,
//   login: loginTexts,
//   register: registryTexts,
//   app: appTexts,
//   appOverview: appOverviewTexts,
//   appDebug: appDebugTexts,
//   appApi: appApiTexts,
//   appLog: appLogTexts,
//   appAnnotation: appAnnotationTexts,
//   share: shareTexts,
//   dataset: datasetTexts,
//   datasetDocuments: datasetDocumentsTexts,
//   datasetHitTesting: datasetHitTestingTexts,
//   datasetSettings: datasetSettingsTexts,
//   datasetCreation: datasetCreationTexts,
//   explore: exploreTexts,
//   billing: billingTexts,
//   custom: customTexts,
//   tools: toolsTexts,
//   workflow: workflowTexts,
//   runLog: runLogTexts,
//   plugin: pluginTexts,
//   pluginTags: pluginTagsTexts,
//   time: timeTexts,
// };

// function loop(prefix: any, textObjs: any, result: any[]) {
//   Object.keys(prefix ? get(textObjs, prefix) : textObjs).forEach(k => {
//     const p = prefix ? `${prefix}.${k}` : k
//     if (typeof get(textObjs, p) === 'object') {
//       loop(p, textObjs, result)
//     } else {
//       result.push([p, get(textObjs, p)])
//     }
//   })
// }


// let str = ''
// Object.keys(translation).forEach(k => {
//   const result: any[] = []
//   loop('', translation[k], result)
//   result.forEach(r => {
//     if (r[1]) {
//       str += `"${k}.${r[0]}":"${r[1].replaceAll('\n', '\\n')}",` + '\n'
//     }
//   })
// })

// console.log(str)

i18n.use(initReactI18next)
  .init({
    lng: undefined,
    fallbackLng: 'en-US',
    resources,
  })

export const changeLanguage = i18n.changeLanguage
export default i18n
