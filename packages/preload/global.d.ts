
export { }

declare global {
  type AcceptedEvents = '';

  type BridgeApi = {
    maximize: () => void;
    minimize: () => void;
    close: () =>  void;

    login: (username: string, password: string) => void;
    load: () => void;

    on: (name: AcceptedEvents, cb: (...a: any[]) => void, once: boolean = false) => void;
  }

  interface Window {
    bridge: BridgeApi
  }
}