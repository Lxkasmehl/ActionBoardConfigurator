const MAX_PARALLEL_REQUESTS = 10;

export const requestManager = {
  currentRequests: 0,
  waitForOpenSlot: function () {
    return new Promise((resolve) => {
      const check = () => {
        if (this.currentRequests < MAX_PARALLEL_REQUESTS) {
          this.currentRequests++;
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },
  releaseSlot: function () {
    this.currentRequests--;
  },
};
