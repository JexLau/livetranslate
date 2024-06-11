import { PropsWithChildren, useState } from 'react'

export interface TabsList {
  value: string,
  icon: JSX.Element,
  label: string,
}

export interface TabsProps extends PropsWithChildren {
  tabs: TabsList[],
  active: string,
  onChange?: (value: TabsList) => void
}

export const Tabs = ({ tabs, active, children, onChange }: TabsProps) => {
  // const [activeTab, setActiveTab] = useState(active);
  const handleTabClick = (tab: TabsList) => {
    // setActiveTab(tab);
    onChange?.(tab)
  };

  return <div className='flex w-full h-full'>
    <div className="flex border-r flex-col bg-[#252a3a]">
      {tabs.map(item => {
        return <button className={`py-4 px-6 color-[#616161] hover:bg-[#3b3f58]`}
          onClick={() => handleTabClick(item)}
          key={item.value}
        >
          {/* <span className='inline-block w-[30px] h-[30px]'></span> */}
          {item.icon}
        </button>
      })}
    </div>
    <div className='flex-1'>{children}</div>
  </div>
}