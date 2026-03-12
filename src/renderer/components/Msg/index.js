import { ElMessage } from 'element-plus'

const queue = []
const maxLength = 5

const defaultOption = { showClose: true }

const msgProxy = new Proxy(ElMessage, {
  get (obj, prop) {
    return (arg) => {
      if (!(arg instanceof Object)) {
        arg = { message: arg }
      }
      const task = {
        run () {
          const method = typeof obj[prop] === 'function' ? obj[prop] : obj
          method({
            ...defaultOption,
            ...arg,
            onClose (...data) {
              const currentTask = queue.pop()
              if (currentTask) {
                currentTask.run()
              }
              if (arg.onClose) {
                arg.onClose(...data)
              }
            }
          })
        }
      }

      if (queue.length >= maxLength) {
        queue.pop()
      }
      queue.unshift(task)

      if (queue.length === 1) {
        queue.pop().run()
      }
    }
  }
})

export default {
  install (app) {
    app.config.globalProperties.$msg = msgProxy
  }
}
