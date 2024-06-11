import { PropsWithChildren, useEffect, useState } from 'react';
import { useCommonContext } from '../../background/context/index';
import { ReactSVG } from 'react-svg'
import SubscribeSvg from "/icons/subscribe.svg"

interface HomeTabProps extends PropsWithChildren {
  open: () => void
}

export const HomeTab = ({ open }: HomeTabProps) => {
  const { amount, recordTotal, sysConfig, userData, isPro, cancelUrl } = useCommonContext()
  const [notify, setNotify] = useState('')

  useEffect(() => {
    const target = sysConfig.find(item => item.id === 1)
    setNotify(target?.config_value || '')
  }, [sysConfig])

  const renderSub = () => {
    if (userData?.id && !isPro) {
      return <span className='mt-[10px] inline-flex cursor-pointer items-center justify-center text-xs' onClick={() => open && open()}>
        {/* @ts-ignore */}
        <svg t="1689417228143" class="h-4 w-4" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8069" width="200" height="200"><path d="M594.610979 817.742673a20.380379 20.380379 0 0 0-20.380379 20.380379v81.731115a20.380379 20.380379 0 0 0 40.760758 0v-81.731115a20.380379 20.380379 0 0 0-20.380379-20.380379zM446.128883 815.276808a20.380379 20.380379 0 0 0-20.429697 20.417367v81.731115a20.380379 20.380379 0 0 0 40.760758 0v-81.731115a20.380379 20.380379 0 0 0-20.331061-20.417367z" fill="#386ED3" p-id="8070"></path><path d="M501.549212 817.742673m20.380379 0l0 0q20.380379 0 20.380379 20.380379l0 165.496569q0 20.380379-20.380379 20.380379l0 0q-20.380379 0-20.380379-20.380379l0-165.496569q0-20.380379 20.380379-20.380379Z" fill="#386ED3" p-id="8071"></path><path d="M768.454502 438.098009S793.236451 164.978737 515.308742 0c0 0-252.307366 130.185373-252.307367 438.098009 0 0-233.985985 171.205047 31.094565 346.281503l53.607918-81.065331 70.43745 81.842079h195.160932l70.43745-81.842079 38.048306 81.718786 81.657139-81.657139s139.752932-145.510728-34.990633-265.277819z m-247.240012 51.413297a110.963951 110.963951 0 1 1 110.963951-110.963951 110.963951 110.963951 0 0 1-110.963951 110.963951z" fill="#386ED3" p-id="8072"></path></svg>
        <span className='underline'>Upgrade Now</span>
      </span>
    }
  }

  const renderNormal = () => {
    return <div className="mb-2 border border-gray-100 px-2 py-2">
      <h2 className='my-2 text-base font-bold text-[#3a69fe]'>Quick Start</h2>
      <div className='flex w-full'>
        <img src="/icons/quick-start.png" className='ml-4 h-[125px] w-[178px] flex-shrink-0' />
        <div className='flex flex-grow flex-col'>
          <h3 className='mb-2 text-base font-bold'>Scrape Live Translate with One-Click</h3>
          <p>One click to scrape data from Live Translate and export to CSV file, includes reviews, images, phone number, email address and social media profiles.</p>
          <a target="_blank" href="https://www.youtube.com/live/RXeOiIDNNek"
            className="mt-[10px] inline-block w-[180px] rounded bg-[rgb(37,55,236,1)] px-4 py-2 text-center font-bold text-white hover:bg-[rgb(37,55,236,0.8)]">Open Live Translate →</a>
        </div>
      </div>
    </div>
  }

  const renderPro = () => {
    return <div className="mb-2 border border-gray-100 px-2 py-2">
      <h2 className='my-2 text-base font-bold text-[#3a69fe]'>Membership version</h2>
      <div className='flex w-full'>
        <div className='flex h-[125px] w-[178px] flex-shrink-0 items-center justify-center'>
          <ReactSVG src={SubscribeSvg} beforeInjection={(svg) => {
            svg.setAttribute('style', 'width: 100px;')
            svg.setAttribute('fill', 'rgb(37,55,236,1)')
          }} />
        </div>
        <div className='ml-[20px] flex flex-grow flex-col'>
          <h3 className='mb-2 text-base font-bold'>Professional Edition</h3>
          <p>Monthly leads export 100,000</p>
          <p className='mb-2'>Export Unlimited records at a time</p>
          <a target="_blank" href="https://www.youtube.com/live/RXeOiIDNNek"
            className="mt-[10px] inline-block w-[180px] rounded bg-[rgb(37,55,236,1)] px-4 py-2 text-center font-bold text-white hover:bg-[rgb(37,55,236,0.8)]">Open Live Translate →</a>
        </div>
      </div>
    </div>
  }

  return (<div className="w-[580px] px-4 py-4">
    {isPro ? renderPro() : renderNormal()}
    <div className="mb-2 border border-gray-100 px-2 py-2">
      <h2 className='my-2 flex items-center justify-between text-base font-bold text-[#3a69fe]'>
        <span>Limit of membership</span>
        {renderSub()}
      </h2>
      <p>Your {amount?.toLocaleString()} leads will renew on next month</p>
      <div className="mt-[10px] h-[20px] w-full rounded-md bg-gray-200">
        <div className="h-full rounded-md bg-[#3a69fe]" style={{ width: `${(recordTotal / amount) * 100 > 100 ? 100 : (recordTotal / amount) * 100}%` }}></div>
      </div>
      <div className="w-full text-right text-gray-400">{recordTotal}/{amount}</div>
    </div>
    {/* {notify && <div className='mt-[30px] flex items-center'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3a69fe" className="mr-2 h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
      <div dangerouslySetInnerHTML={{ __html: notify }}></div>
    </div>} */}
  </div>)
}