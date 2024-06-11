import { useEffect } from 'react';

export const Loading = () => {
  useEffect(() => {
    document.getElementById('__root')?.setAttribute('style', 'width: 320px;height: 260px;')
  }, [])

  return <div className="w-full h-full flex justify-center items-center ">
    <div
      className={`h-10 w-10 animate-spin rounded-full border-4 border-blue-[#07d6a4] border-t-transparent`}
    />
  </div>
}