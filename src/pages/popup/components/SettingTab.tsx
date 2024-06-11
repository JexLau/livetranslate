import { useState, useEffect, PropsWithChildren } from "react";
import { Loading } from "@src/components"
import { ConfigProps, getConfig, getProConfig, saveConfig, saveProConfig } from "../../background/config"
import { logout } from "../../background"
import { useCommonContext } from "../../background/context/index"

type ConfigType = 'proConfig' | 'config'
interface SettingTabProps extends PropsWithChildren {
  onLogout: () => void
}

export const SettingTab = (props:SettingTabProps) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConfigProps[]>([]);
  const [proConfig, setProConfig] = useState<ConfigProps[]>([]);
  const { isPro } = useCommonContext()

  const getUserConfig = async () => {
    const fileConfig = await getConfig()
    setConfig(fileConfig)
    const fileProConfig = await getProConfig()
    setProConfig(fileProConfig)
  }

  useEffect(() => {
    getUserConfig()
  }, [isPro])

  const handleLogout = () => {
    setLoading(true)
    setTimeout(async () => {
      props?.onLogout()
      setLoading(false)
      await logout()
    }, 200)
  }

  const onSelect = async (item: ConfigProps, type: ConfigType) => {
    if (type === 'config') {
      const newConfig = config.map((configItem) => {
        if (configItem.name === item.name) {
          return {
            ...configItem,
            check: !configItem.check
          }
        }
        return configItem
      })
      setConfig(newConfig)
      await saveConfig(newConfig)
    }
    if (isPro && type === "proConfig") {
      const newConfig = proConfig.map((configItem) => {
        if (configItem.name === item.name) {
          return {
            ...configItem,
            check: !configItem.check
          }
        }
        return configItem
      })
      setProConfig(newConfig)
      await saveProConfig(newConfig)
    }
  }

  const listItem = (item: ConfigProps, flag: ConfigType) => {
    return <li
      key={item.name}
      className={`inline-flex justify-center items-center px-[8px] py-[4px] m-[4px] text-white rounded 
      ${(flag === 'proConfig' && !isPro) ? 'bg-[#d9d9d9] cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600  cursor-pointer'}`}
      onClick={() => {
        if (flag === 'proConfig' && !isPro) return
        onSelect(item, flag)
      }}
    >
      <span className='mr-[4px]'>
        {/* @ts-ignore: 忽略svg */}
        {item.check ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" class="w-4 h-4">
          <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
        </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#fff" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        }
      </span>
      <span>{item.name}</span>
    </li>
  }

  return (
    <div className="w-[500px] px-2 py-2">
      <div className="text-sm font-bold text-[#7a7a7a]">Please click to select / unselect what you want to export.</div>
      <ul>
        {config.map((item) => listItem(item, 'config'))}
      </ul>
      <div className="text-sm font-bold text-[#7a7a7a] mt-[10px]">PRO Features</div>
      <ul>
        {proConfig.map((item) => listItem(item, 'proConfig'))}
      </ul>
      <div className='flex items-center mt-[20px] justify-center w-full'>
        <button className="py-1.5 px-3  border-solid  border-2 border-[rgb(80,63,220,1)] font-bold hover:bg-[rgb(80,63,220,0.1)] text-base rounded-lg space-x-3"
          onClick={() => handleLogout()}
        >
          {!loading ? <p>Logout</p> : <Loading />}
        </button>
      </div>
    </div>
  );
}