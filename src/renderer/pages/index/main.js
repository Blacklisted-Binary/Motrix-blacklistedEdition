import is from 'electron-is'
import { ipcRenderer } from 'electron'
import { createApp } from 'vue'
import I18NextVue from 'i18next-vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'

import App from './App'
import router from '@/router'
import store from '@/store'
import { getLocaleManager } from '@/components/Locale'
import Icon from '@/components/Icons/Icon'
import Msg from '@/components/Msg'
import { commands } from '@/components/CommandManager/instance'
import TrayWorker from '@/workers/tray.worker'

import 'element-plus/dist/index.css'
import '@/components/Theme/Index.scss'

const updateTray = is.renderer()
  ? async (payload) => {
    const { tray } = payload
    if (!tray) {
      return
    }

    const ab = await tray.arrayBuffer()
    ipcRenderer.send('command', 'application:update-tray', ab)
  }
  : () => {}

function initTrayWorker () {
  const worker = new TrayWorker()

  worker.addEventListener('message', (event) => {
    const { type, payload } = event.data

    switch (type) {
    case 'initialized':
    case 'log':
      console.log('[Motrix] Log from Tray Worker: ', payload)
      break
    case 'tray:drawed':
      updateTray(payload)
      break
    default:
      console.warn('[Motrix] Tray Worker unhandled message type:', type, payload)
    }
  })

  return worker
}

function init (config) {
  const { locale } = config
  const localeManager = getLocaleManager()
  localeManager.changeLanguageByLocale(locale)

  const app = createApp(App)

  app.config.globalProperties.$http = axios

  app.use(router)
  app.use(store)
  app.use(I18NextVue, { i18next: localeManager.getI18n() })
  app.use(ElementPlus, { size: 'mini' })
  app.use(Msg)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.component('mo-icon', Icon)

  const instance = app.mount('#app')

  global.app = instance
  global.app.commands = commands
  require('./commands')

  global.app.trayWorker = initTrayWorker()
}

store.dispatch('preference/fetchPreference')
  .then((config) => {
    console.info('[Motrix] load preference:', config)
    init(config)
  })
  .catch((err) => {
    alert(err)
  })
