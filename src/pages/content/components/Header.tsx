import React, { PropsWithChildren } from 'react';
import { ReactSVG } from 'react-svg'

interface GHeaderProps extends PropsWithChildren {
  open?: () => void,
  isLogin?: boolean,
  isPro?: boolean
}


export const GHeader = ({open, isLogin = false, isPro = true}: GHeaderProps) => {
  const openSubscribe = () => {
    open && open()
  }
  
  return (
    <div className="flex items-center justify-between w-full cursor-move">
      <div className='flex items-center'>
        <div>
          <img src={chrome.runtime.getURL('/icon-128.png')} className='w-[24px] h-[24px] mr-[10px]' />
        </div>
        <div className="font-extrabold">Live Translate</div>
      </div>
      {(isLogin && !isPro) && <div className='cursor-pointer' onClick={() => openSubscribe()}>
        <ReactSVG src={chrome.runtime.getURL('/icons/subscribe.svg')} beforeInjection={(svg) => {
          svg.setAttribute('class', 'h-[22px] w-[22px]')
          svg.setAttribute('fill', '#70757a')
        }} />
      </div>
      }
    </div>
  );
};

export default GHeader;
