import { defineStore } from 'pinia';

const DEFAULT_MESSAGE = {
  title: 'Loading the next setlist…',
  subtitle: 'Holding the door between worlds',
  minDurationMs: 1500,
};

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    isTransitioning: false,
    title: DEFAULT_MESSAGE.title,
    subtitle: DEFAULT_MESSAGE.subtitle,
    minDurationMs: DEFAULT_MESSAGE.minDurationMs,
    hideDelayMs: 320,
    startedAt: 0,
    _hideTimer: null,
  }),
  actions: {
    startTransition(message = DEFAULT_MESSAGE) {
      if (this._hideTimer) {
        clearTimeout(this._hideTimer);
        this._hideTimer = null;
      }

      const nextMessage = {
        title: message.title ?? DEFAULT_MESSAGE.title,
        subtitle: message.subtitle ?? DEFAULT_MESSAGE.subtitle,
        minDurationMs: Number.isFinite(message.minDurationMs)
          ? message.minDurationMs
          : DEFAULT_MESSAGE.minDurationMs,
      };

      this.title = nextMessage.title;
      this.subtitle = nextMessage.subtitle;
      this.minDurationMs = nextMessage.minDurationMs;
      this.isTransitioning = true;
      this.startedAt = Date.now();
    },
    finishTransition() {
      if (!this.isTransitioning) return;

      if (this._hideTimer) {
        clearTimeout(this._hideTimer);
      }

      const elapsed = this.startedAt ? Date.now() - this.startedAt : 0;
      const remainingMinDuration = Math.max(this.minDurationMs - elapsed, 0);
      const delay = Math.max(remainingMinDuration, this.hideDelayMs);

      this._hideTimer = setTimeout(() => {
        this.isTransitioning = false;
        this.startedAt = 0;
        this._hideTimer = null;
      }, delay);
    },
  },
});

export function extractTransitionMessage(to) {
  if (!to) return DEFAULT_MESSAGE;

  const metaMessage = to.meta?.transitionMessage;
  const hasCustomCopy = Boolean(metaMessage?.title || metaMessage?.subtitle);
  const hasDuration = Number.isFinite(metaMessage?.minDurationMs);

  if (metaMessage && (hasCustomCopy || hasDuration)) {
    return {
      title: metaMessage.title || DEFAULT_MESSAGE.title,
      subtitle: metaMessage.subtitle || DEFAULT_MESSAGE.subtitle,
      minDurationMs: Number.isFinite(metaMessage.minDurationMs)
        ? metaMessage.minDurationMs
        : DEFAULT_MESSAGE.minDurationMs,
    };
  }

  return DEFAULT_MESSAGE;
}
