<template>
  <div v-if="false"></div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import { commands } from '@/components/CommandManager/instance'

  export default {
    name: 'mo-ipc',
    methods: {
      bindIpcEvents () {
        ipcRenderer.on('command', (event, command, ...args) => {
          commands.execute(command, ...args)
        })
      },
      unbindIpcEvents () {
        ipcRenderer.removeAllListeners('command')
      }
    },
    created () {
      this.bindIpcEvents()
    },
    unmounted () {
      this.unbindIpcEvents()
    }
  }
</script>
