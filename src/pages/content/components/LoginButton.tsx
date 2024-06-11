import { signInWithGoogle } from '../../background';
import { ReactSVG } from 'react-svg'

export const LoginButton = () => {
  return (
    <button className="flex w-[90%] items-center justify-center space-x-3 rounded-lg border-2 border-solid border-[rgb(80,63,220,1)] py-1.5 text-base font-bold hover:bg-[rgb(80,63,220,0.1)]"
      onClick={() => signInWithGoogle()}
    >
      <ReactSVG src={chrome.runtime.getURL('/icons/google.svg')} beforeInjection={(svg) => {
        svg.setAttribute('class', 'h-4 w-4')
      }} />
      <p>Login with Goolge</p>
    </button>
  );
};

export default LoginButton;
