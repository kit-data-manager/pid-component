import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import {
  initPidDetection,
  type PidDetectionConfig,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

interface AutodiscoveryContextValue {
  root: React.RefObject<HTMLElement | null>;
  controller: PidDetectionController | null;
  isActive: boolean;
}

const AutodiscoveryContext = createContext<AutodiscoveryContextValue | null>(null);

interface AutodiscoveryProviderProps {
  children: ReactNode;
  config?: PidDetectionConfig;
  rootRef?: React.RefObject<HTMLElement | null>;
}

export function AutodiscoveryProvider({ children, config = {}, rootRef }: AutodiscoveryProviderProps) {
  const internalRootRef = useRef<HTMLElement | null>(null);
  const controllerRef = useRef<PidDetectionController | null>(null);
  const isActiveRef = useRef(false);

  const setRoot = (element: HTMLElement | null) => {
    if (controllerRef.current || !element) return;
    internalRootRef.current = element;
    controllerRef.current = initPidDetection({
      root: element,
      darkMode: 'light',
      ...config,
    });
    isActiveRef.current = true;
  };

  useEffect(() => {
    if (rootRef?.current) {
      setRoot(rootRef.current);
    }
    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
        isActiveRef.current = false;
      }
    };
  }, [rootRef?.current]);

  const value: AutodiscoveryContextValue = {
    root: rootRef || internalRootRef,
    controller: controllerRef.current,
    isActive: isActiveRef.current,
  };

  return (
    <AutodiscoveryContext.Provider value={value}>
      {children}
    </AutodiscoveryContext.Provider>
  );
}

export function useAutodiscovery() {
  return useContext(AutodiscoveryContext);
}

export function useAutodiscoveryController(): PidDetectionController | null {
  const context = useContext(AutodiscoveryContext);
  return context?.controller || null;
}
