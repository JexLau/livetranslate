import { LoginButton, GHeader } from '@src/components';
import { useCommonContext } from '../pages/background/context';
import { useEffect } from 'react';

export const LoginPanel = () => {

  useEffect(() => {
    document.getElementById('__root')?.setAttribute('style', 'width: 320px;height: 260px;')
  }, [])
  
  const { version } = useCommonContext()
  return <div className="flex h-full w-full flex-col items-center justify-between px-1 py-1">
    <GHeader />
    <div className='mb-[10px] flex flex-col items-center'>
      <h1 className='mb-4 text-3xl font-bold'>Login</h1>
      <p className='relative rounded-md px-4 py-2 text-xs font-bold'>
        {/* 给它加一个下划线和加重 */}
        <span className='underline-highlight'></span>Start Free Trial for Live Translate
      </p>
    </div>
    <LoginButton />
    <div className='my-3 text-gray-500'>v{version}</div>
  </div>
}