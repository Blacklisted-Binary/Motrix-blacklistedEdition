<template>
  <div class="task-media-player">
    <el-empty
      v-if="!activeFile"
      :description="$t('task.media-player-empty')"
      :image-size="72"
    />
    <div v-else class="task-media-player-body">
      <div class="task-media-player-header">
        <span class="task-media-player-title">{{ activeFile.name }}</span>
      </div>
      <div class="task-media-player-content">
        <audio
          v-if="isAudio(activeFile)"
          ref="audio"
          controls
          :src="safeFileUrl(activeFile.path)"
          preload="metadata"
        />
        <video
          v-else-if="isVideo(activeFile)"
          ref="video"
          controls
          playsinline
          preload="metadata"
          :src="safeFileUrl(activeFile.path)"
        />
        <el-alert
          v-else
          type="info"
          :closable="false"
          :title="$t('task.media-player-not-supported')"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Plyr from 'plyr'
  import 'plyr/dist/plyr.css'
  import { AUDIO_SUFFIXES, VIDEO_SUFFIXES } from '@shared/constants'

  export default {
    name: 'mo-task-media-player',
    props: {
      activeFile: {
        type: Object,
        default: null
      }
    },
    data () {
      return {
        player: null
      }
    },
    watch: {
      activeFile () {
        this.$nextTick(() => {
          this.initPlayer()
        })
      }
    },
    mounted () {
      this.initPlayer()
    },
    unmounted () {
      this.destroyPlayer()
    },
    methods: {
      initPlayer () {
        this.destroyPlayer()
        const el = this.$refs.video || this.$refs.audio
        if (!el) {
          return
        }
        this.player = new Plyr(el, {
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'pip',
            'fullscreen'
          ]
        })
      },
      destroyPlayer () {
        if (this.player) {
          this.player.destroy()
          this.player = null
        }
      },
      isAudio (file = {}) {
        return AUDIO_SUFFIXES.includes((file.extension || '').toLowerCase())
      },
      isVideo (file = {}) {
        return VIDEO_SUFFIXES.includes((file.extension || '').toLowerCase())
      },
      safeFileUrl (fullPath = '') {
        if (!fullPath) {
          return ''
        }
        const encoded = encodeURI(fullPath)
        return `file://${encoded}`
      }
    }
  }
</script>

<style lang="scss">
.task-media-player {
  padding: 0.5rem 0.25rem;
}

.task-media-player-body {
  .task-media-player-header {
    margin-bottom: 0.5rem;
  }
  .task-media-player-title {
    font-size: $--font-size-base;
    color: $--color-text-primary;
    font-weight: 500;
  }
  audio,
  video {
    width: 100%;
    max-height: 360px;
    border-radius: 4px;
    outline: none;
    background: #000;
  }
}
</style>
