import { PropsWithChildren, useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { GHeader, Tabs, TabsList } from '@src/components'
import { HomeTab, SubscribeTab, SettingTab } from './index'
import HomeSvg from "/icons/home.svg"
import SettingSvg from "/icons/setting.svg"
import SubscribeSvg from "/icons/subscribe.svg"
import { useCommonContext } from '../../background/context'

interface DashboardPanelProps extends PropsWithChildren {
  changeStatus: () => void
}

export const DashboardPanel = (props: DashboardPanelProps) => {
  const { version, userData, isPro } = useCommonContext()
  const [activeTab, setActiveTab] = useState("home");
  const handleTabClick = (tab: TabsList) => {
    setActiveTab(tab.value);
  };

  const changeStatus = () => {
    props?.changeStatus()
  }

  // 动态set width
  useEffect(() => {
  }, [])

  useEffect(() => {
    if (activeTab === 'home') {
      document.getElementById('__root')?.setAttribute('style', 'width: 650px;')
    } else if (activeTab === 'subscribe') {
      document.getElementById('__root')?.setAttribute('style', 'width: 750px;')
    } else if (activeTab === 'setting') {
      document.getElementById('__root')?.setAttribute('style', 'width: 570px;')
    }
  }, [activeTab])

  const tabList = [{
    value: 'home',
    icon: <ReactSVG src={HomeSvg} beforeInjection={(svg) => {
      svg.setAttribute('style', 'width: 22px;')
      svg.setAttribute('fill', activeTab === 'home' ? '#FFF' : '#666')
    }} />,
    label: 'Home'
  }, {
    value: 'subscribe',
    icon: <ReactSVG src={SubscribeSvg} beforeInjection={(svg) => {
      svg.setAttribute('style', 'width: 22px;')
      svg.setAttribute('fill', activeTab === 'subscribe' ? '#FFF' : '#666')
    }} />,
    label: 'Subscribe'
  }, {
    value: 'setting',
    icon: <ReactSVG src={SettingSvg} beforeInjection={(svg) => {
      svg.setAttribute('style', 'width: 22px;')
      svg.setAttribute('fill', activeTab === 'setting' ? '#FFF' : '#666')
    }} />,
    label: 'Setting'
  }]
  // {chrome.i18n.getMessage('payonce')}
  return (<div className='w-full h-full flex flex-col'>
    <GHeader open={() => setActiveTab("subscribe")} isLogin={!!userData?.id} isPro={isPro} activeTab={activeTab} />
    <div className="w-full flex justify-center flex-grow border-t border-t-gray-200 relative">
      <Tabs tabs={tabList} active={activeTab} onChange={handleTabClick}>
        {activeTab === 'home' && <HomeTab open={() => setActiveTab("subscribe")} />}
        {activeTab === 'subscribe' && <SubscribeTab />}
        {activeTab === 'setting' && <SettingTab onLogout={() => changeStatus()} />}
      </Tabs>
      <div className='absolute bottom-4 left-[20px] text-white'>v{version}</div>
    </div>
  </div>)
}