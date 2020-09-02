import React, { useEffect, useState } from 'react';

interface Props {
  url: string;
  protocol: string;
  onOpen?: CallableFunction | null;
  onClose?: CallableFunction | null;
  onMessage: CallableFunction;
  reconnect?: boolean;
  reconnectIntervalInMilliSeconds?: number;
}

interface State {
  attempts: number;
}

export default function Websocket(props: Props) {
  let ws: any = null;
  let timeoutID: any = null;
  const {
    url,
    protocol,
    reconnectIntervalInMilliSeconds,
    onMessage,
    onOpen,
  } = props;
  const [state, setState] = useState<State>({
    attempts: 0,
  });

  const generateInterval = (k: number) => {
    if (
      reconnectIntervalInMilliSeconds &&
      reconnectIntervalInMilliSeconds > 0
    ) {
      return reconnectIntervalInMilliSeconds;
    }
    return Math.min(30, 2 ** k - 1) * 1000;
  };

  const setupWebsocket = () => {
    // const websocket = ws
    if (ws) {
      ws.onopen = () => {
        if (typeof onOpen === 'function') onOpen();
      };

      ws.onmessage = (evt: any) => {
        onMessage(evt.data);
      };

      const shouldReconnect = props.reconnect;
      ws.onclose = () => {
        if (typeof props.onClose === 'function') props.onClose();
        if (shouldReconnect) {
          const time = generateInterval(state.attempts);
          timeoutID = setTimeout(() => {
            ws = new WebSocket(props.url, props.protocol);
            setState({
              attempts: state.attempts + 1,
            });
            setupWebsocket();
          }, time);
        }
      };
    }
  };

  const sendMessage = (message: any) => {
    const websocket = ws;
    websocket.send(message);
  };

  useEffect(() => {
    ws = new WebSocket(url, protocol);
    setupWebsocket();
    return () => {
      const websocket = ws;
      websocket.close();
    };
  });

  return <div />;
}

Websocket.defaultProps = {
  onClose: null,
  onOpen: null,
  reconnect: true,
  reconnectIntervalInMilliSeconds: 100,
};
