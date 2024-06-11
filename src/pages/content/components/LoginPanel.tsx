import React from 'react';
import { GHeader } from './Header';
import { LoginButton } from './LoginButton';
import { useCommonContext } from '../../background/context';

export const LoginPanel = () => {
  const { version } = useCommonContext()
  return <div className="w-full h-full flex flex-col justify-between items-center py-2 px-2">
  <GHeader />
  <div className='flex flex-col items-center mb-[10px]'>
    <h1 className='font-bold text-3xl mt-2 mb-4'>Login</h1>
    <p className='relative font-bold text-xs px-4 py-2 rounded-md'>
      {/* 给它加一个下划线和加重 */}
      <span className=' inline-block z-0 w-[92px] h-[4px] absolute bottom-[10px] left-[14px] bg-[#3a69fe3b]'></span>Start Free Trial for Live Translate
    </p>
  </div>
  <LoginButton />
  <div className='mt-3 text-gray-500 text-xs'>v{version}</div>
</div>
}