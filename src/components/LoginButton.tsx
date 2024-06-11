import { signInWithGoogle } from '../pages/background';
import { ReactSVG } from 'react-svg'
import GoogleSvg from "/icons/google.svg"

export const LoginButton = () => {
  return (
    <button className="flex items-center 
      justify-center w-[90%] py-1.5  border-2 border-[rgb(80,63,220)]
     font-bold hover:bg-[rgb(80,63,220,0.1)] text-base rounded-lg space-x-3"
      onClick={() => signInWithGoogle()}
    >
      <ReactSVG src={GoogleSvg} beforeInjection={(svg) => {
        svg.setAttribute('class', 'h-4 w-4')
      }} />
      <p>Login with Goolge</p>
    </button>
  );
};

export default LoginButton;
