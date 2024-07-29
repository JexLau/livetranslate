import { randomUUID } from 'crypto';

interface Message {
  destination: {
    context: string;
    frameId?: number;
    tabId?: number;
  };
  origin: {
    context: string;
    tabId: number | null;
  };
  transactionId: string;
  messageID: string;
  messageType: 'message' | 'reply';
  data: any;
  err?: any;
  timestamp: number;
  hops: string[];
}

interface EndpointRuntime {
  handleMessage: (message: Message) => void;
  endTransaction: (transactionID: string) => void;
  sendMessage: (messageID: string, data: any, destination?: string | { context: string }) => Promise<any>;
  onMessage: (messageID: string, callback: (message: any) => void) => () => void;
}

function createEndpointRuntime(thisContext: string, routeMessage: (message: Message) => void, localMessage?: (message: Message) => void): EndpointRuntime {
  const runtimeId = randomUUID();
  const openTransactions = new Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }>();
  const onMessageListeners = new Map<string, (message: any) => void>();

  const handleMessage = (message: Message) => {
    // ... (message handling logic)
  };

  return {
    handleMessage,
    endTransaction: (transactionID) => {
      const transactionP = openTransactions.get(transactionID);
      transactionP?.reject("Transaction was ended before it could complete");
      openTransactions.delete(transactionID);
    },
    // sendMessage: (messageID, data, destination = "background") => {
    //   // ... (send message logic)
    // },
    onMessage: (messageID, callback) => {
      onMessageListeners.set(messageID, callback);
      return () => onMessageListeners.delete(messageID);
    }
  };
}

export default createEndpointRuntime;