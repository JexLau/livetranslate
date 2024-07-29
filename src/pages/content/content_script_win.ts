interface ContentScriptWin {
  enable: () => void;
  onMessage: (cb: (msg: any) => void) => void;
  postMessage: (msg: any) => Promise<void>;
  setNamespace: (nsps: string) => void;
}

const content_script_win: ContentScriptWin = (() => {
  let allocatedNamespace: string;
  let onMessageCallback: ((msg: any) => void) | undefined;
  let portP: Promise<MessagePort>;
  let messagingEnabled = false;

  return {
    enable: () => messagingEnabled = true,
    onMessage: (cb) => onMessageCallback = cb,
    postMessage: async (msg) => {
      if (!messagingEnabled) {
        throw new Error("Communication with window has not been allowed");
      }
      if (!allocatedNamespace) {
        throw new Error("Namespace not set");
      }
      (await portP).postMessage(msg);
    },
    setNamespace: (nsps) => {
      if (allocatedNamespace) {
        throw new Error("Namespace once set cannot be changed");
      }
      allocatedNamespace = nsps;
      // portP = initializePort("content-script", nsps, (data) => onMessageCallback?.(data));
    }
  };
})();

// function initializePort(thisContext: string, namespace: string, onMessage?: (data: any) => void): Promise<MessagePort> {
//   // ... (port initialization logic)
  
// }

export default content_script_win;