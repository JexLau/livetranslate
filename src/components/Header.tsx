import { ReactSVG } from 'react-svg'
import { PropsWithChildren, useState } from 'react';
import SubscribeSvg from "/icons/subscribe.svg"
import { useCommonContext } from '../pages/background/context';
import { ConfirmDialog } from './ConfirmDialog';

interface GHeaderProps extends PropsWithChildren {
  open?: () => void,
  isLogin?: boolean,
  isPro?: boolean,
  activeTab?: string
}

export const GHeader = ({ open, isLogin, isPro, activeTab }: GHeaderProps) => {
  const { cancelUrl } = useCommonContext()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const renderSub = () => {
    if (isLogin && !isPro) {
      return <span
        className=' text-gray-500 rounded-t-sm cursor-pointer border-gray-300 border px-2 py-1 inline-flex justify-center items-center'
        onClick={() => open && open()}
      >
        <ReactSVG src={SubscribeSvg} beforeInjection={(svg) => {
          svg.setAttribute('style', 'width: 22px;')
          svg.setAttribute('fill', '#666')
        }} />
        <span className='ml-1'>UPGRADE</span>
      </span>
    }
  }

  const renderCancelSub = () => {
    if (isLogin && isPro && activeTab === 'setting') {
      return <span
        className=' text-gray-500 rounded-t-sm cursor-pointer border-gray-300 border px-2 py-1 inline-flex justify-center items-center'
        onClick={() => {
          // 二次确认弹窗
          setShowConfirmDialog(true)
        }}
      >
        <ReactSVG src={SubscribeSvg} beforeInjection={(svg) => {
          svg.setAttribute('style', 'width: 22px;')
          svg.setAttribute('fill', '#666')
        }} />
        <span className='ml-1'>Cancel Subscribe</span>
      </span>
    }
  }

  return (
    <div className="flex items-center justify-between w-full px-2 py-2">
      <div className='flex items-center'>
        <img src="/icon-128.png" className='w-[24px] h-[24px] mr-[10px]' />
        <div className="font-extrabold text-lg">Live Translate</div>
      </div>
      {renderSub()}
      {renderCancelSub()}
      {showConfirmDialog && <ConfirmDialog
        message="Are you certain about canceling your subscription?"
        onConfirm={() => {
          if (cancelUrl) {
            window.open(cancelUrl)
          }
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />}
    </div>
  );
};

export default GHeader;
