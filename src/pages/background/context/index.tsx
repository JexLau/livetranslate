import React, { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, getUserRole, getScrapeRecord, getSysConfig, getSubLink } from "../index";
import pkg from '../../../../package.json';

interface CommonContextProps {
  userData: { id: string, email?: string },
  version: string,
  isPro: boolean,
  // 额度
  amount: number,
  // 限额
  limit: number,
  // 已使用额度
  recordTotal: number,
  loading: boolean,
  sysConfig: any[],
  cancelUrl: string,
}

const CommonContext = createContext<CommonContextProps>({
  userData: { id: '', },
  version: pkg.version,
  isPro: false,
  // 额度
  amount: 1000,
  // 限额
  limit: 15,
  // 已使用额度
  recordTotal: 0,
  loading: false,
  sysConfig: [],
  cancelUrl: "",
});

export const CommonProvider = ({ children }: PropsWithChildren) => {
  // const [showLoginModal, setShowLoginModal] = useState(false)
  // const [showAuthUI, setShowAuthUI] = useState(false)
  // const [showUpgrade, setShowUpgrade] = useState(false)
  const [userData, setUserData] = useState<{ id: string, email?: string }>({ id: '' })
  const [loading, setLoading] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [amount, setAmount] = useState(1000)
  const [recordTotal, setRecordTotal] = useState(0)
  const [cancelUrl, setCancelUrl] = useState('')
  const [sysConfig, setSysConfig] = useState<any[]>([])
  console.log("CommonProvider")


  async function init() {
    try {
      setLoading(true)
      // const { user } = await getCurrentUser()
      // if (user?.id) {
      //   setUserData(user)
      //   await getRole(user.id)
      //   setLoading(false)
      //   getAmountUsed(user.id)
      //   getCancelUrl(user.id)
      //   getSystemConfig()
      // }
    } finally {
      setLoading(false)
    }
  }

  async function getRole(userId: string) {
    const result = await getUserRole(userId)
    setIsPro(result)
    if (result) {
      setAmount(100000)
    }
  }

  const getSystemConfig = async () => {
    const result = await getSysConfig()
    if (result) {
      setSysConfig(result)
    }
  }

  const getCancelUrl = async (userId: string) => {
    const result = await getSubLink(userId)
    // setCancelUrl(result?.subscription_cancel_url || '')
  }

  const getAmountUsed = async (userId: string) => {
    // if (!userId) {
    //   return 0
    // }
    // const userRecords = await getScrapeRecord(userId)
    // const recordTotal = userRecords.reduce((p, c) => (p || 0) + (typeof c?.count === 'number' ? c.count : 0), 0)
    // setRecordTotal(recordTotal)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <CommonContext.Provider
      value={{
        userData,
        version: pkg.version,
        isPro,
        // 额度
        amount,
        // 限额
        limit: 15,
        // 已使用额度
        recordTotal,
        loading,
        sysConfig,
        cancelUrl,
        // setUserData,
        // showLoginModal, setShowLoginModal,
        // showAuthUI, setShowAuthUI,
        // clickSideBar, setClickSideBar,
        // showUpgrade, setShowUpgrade,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};


export const useCommonContext = () => useContext(CommonContext)