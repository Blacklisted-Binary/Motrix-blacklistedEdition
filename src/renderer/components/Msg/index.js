import { ElMessage } from 'element-plus'

const queue = []
const maxLength = 5

const defaultOption = { showClose: true }

// ElMessage supports direct call as well as ElMessage.success/warning/error/info
const msgProxy = new Proxy(ElMessage, {
  get (obj, prop) {
    // Support named methods: success, warning, error, info
    if (typeof obj[prop] === 'function') {
      return (arg) => {
        if (!(arg instanceof Object)) {
          arg = { message: arg }
        }
        const task = {
          run () {
            obj[prop]({
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
    return obj[prop]
  }
})

export default {
  install (app) {
    app.config.globalProperties.$msg = msgProxy
  }
}
