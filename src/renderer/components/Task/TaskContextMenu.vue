<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="task-context-menu"
      :style="menuStyle"
    >
      <ul class="task-context-menu-list">
        <template v-for="item in menuItems" :key="item.action">
          <li
            v-if="item.type !== 'separator'"
            class="task-context-menu-item"
            @click="onItemClick(item)"
          >
            {{ item.label }}
          </li>
          <li v-else class="task-context-menu-separator" />
        </template>
      </ul>
    </div>
    <div
      v-if="visible"
      class="task-context-menu-mask"
      @click="hide"
      @contextmenu.prevent="hide"
    />
  </Teleport>
</template>

<script>
  import is from 'electron-is'
  import { commands } from '@/components/CommandManager/instance'
  import { TASK_STATUS } from '@shared/constants'
  import { checkTaskIsSeeder, getTaskName } from '@shared/utils'
  import { getTaskFullPath } from '@/utils/native'

  export default {
    name: 'mo-task-context-menu',
    data () {
      return {
        visible: false,
        x: 0,
        y: 0,
        task: null
      }
    },
    computed: {
      menuStyle () {
        return {
          left: `${this.x}px`,
          top: `${this.y}px`
        }
      },
      isSeeder () {
        return this.task ? checkTaskIsSeeder(this.task) : false
      },
      taskStatus () {
        const { task, isSeeder } = this
        if (!task) return null
        return isSeeder ? TASK_STATUS.SEEDING : task.status
      },
      menuItems () {
        const { task, taskStatus } = this
        if (!task) return []

        const items = []
        const { ACTIVE, PAUSED, WAITING, COMPLETE, ERROR, REMOVED, SEEDING } = TASK_STATUS

        if (taskStatus === ACTIVE) {
          items.push({ action: 'PAUSE', label: this.$t('task.pause-task') })
        }
        if (taskStatus === PAUSED || taskStatus === WAITING) {
          items.push({ action: 'RESUME', label: this.$t('task.resume-task') })
        }
        if (taskStatus === SEEDING) {
          items.push({ action: 'STOP', label: this.$t('task.stop-seeding') })
        }
        if ([ERROR, COMPLETE, REMOVED].includes(taskStatus)) {
          items.push({ action: 'RESTART', label: this.$t('task.restart-task') })
        }

        if ([WAITING, PAUSED].includes(taskStatus)) {
          items.push({ type: 'separator' })
          items.push({ action: 'MOVE_UP', label: this.$t('task.move-task-up') })
          items.push({ action: 'MOVE_DOWN', label: this.$t('task.move-task-down') })
        }

        items.push({ type: 'separator' })

        if (is.renderer()) {
          items.push({ action: 'FOLDER', label: this.$t('task.show-in-folder') })
        }
        items.push({ action: 'LINK', label: this.$t('task.copy-link') })
        items.push({ action: 'INFO', label: this.$t('task.task-detail-title') })

        items.push({ type: 'separator' })

        if ([ERROR, COMPLETE, REMOVED].includes(taskStatus)) {
          items.push({ action: 'TRASH', label: this.$t('task.remove-record') })
        } else {
          items.push({ action: 'DELETE', label: this.$t('task.delete-task') })
        }

        return items
      }
    },
    methods: {
      show ({ x, y, task }) {
        this.task = task
        this.visible = true

        this.$nextTick(() => {
          const menuEl = this.$el?.querySelector('.task-context-menu') || null
          const menuWidth = menuEl ? menuEl.offsetWidth : 160
          const menuHeight = menuEl ? menuEl.offsetHeight : 200
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight

          this.x = x + menuWidth > windowWidth ? x - menuWidth : x
          this.y = y + menuHeight > windowHeight ? y - menuHeight : y
        })
      },
      hide () {
        this.visible = false
        this.task = null
      },
      onItemClick (item) {
        const { task } = this
        if (!task) return

        const taskName = getTaskName(task)
        const path = getTaskFullPath(task)

        switch (item.action) {
        case 'PAUSE':
          commands.emit('pause-task', { task, taskName })
          break
        case 'RESUME':
          commands.emit('resume-task', { task, taskName })
          break
        case 'STOP':
          commands.emit('stop-task-seeding', { task })
          break
        case 'RESTART':
          commands.emit('restart-task', { task, taskName, showDialog: true })
          break
        case 'DELETE':
          commands.emit('delete-task', { task, taskName, deleteWithFiles: false })
          break
        case 'TRASH':
          commands.emit('delete-task-record', { task, taskName, deleteWithFiles: false })
          break
        case 'FOLDER':
          commands.emit('reveal-in-folder', { path })
          break
        case 'LINK':
          commands.emit('copy-task-link', { task })
          break
        case 'INFO':
          commands.emit('show-task-info', { task })
          break
        case 'MOVE_UP':
          this.$store.dispatch('task/moveTaskUp', task)
          break
        case 'MOVE_DOWN':
          this.$store.dispatch('task/moveTaskDown', task)
          break
        }

        this.hide()
      }
    }
  }
</script>

<style lang="scss">
.task-context-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
}

.task-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  background-color: $--task-item-background;
  border: 1px solid $--task-item-border-color;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  user-select: none;
}

.task-context-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.task-context-menu-item {
  padding: 7px 16px;
  font-size: 13px;
  cursor: pointer;
  color: $--task-item-action-color;
  white-space: nowrap;
  &:hover {
    background-color: $--task-item-action-hover-background;
    color: $--task-item-action-hover-color;
  }
}

.task-context-menu-separator {
  height: 1px;
  background-color: $--task-item-border-color;
  margin: 4px 0;
}
</style>
