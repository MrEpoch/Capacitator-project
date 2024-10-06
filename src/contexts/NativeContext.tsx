"use client";
// import { App } from "@capacitor/app";
import { createContext, useContext } from "react";

// eslint-disable-next-line 
export type nativeContextType = {};

const NativeContext = createContext({} as nativeContextType);

export const useNative = () => {
  const context = useContext(NativeContext);
  if (context === undefined || context === null) {
    return {};
  }
  return context;
};

export default function NativeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NativeContext.Provider value={{}}>{children}</NativeContext.Provider>;
}
