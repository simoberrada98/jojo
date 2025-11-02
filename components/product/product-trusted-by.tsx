import Image from 'next/image';
import TrustPilotLogo from '@/public/svgs/trust-pilot.svg';
import AmvLogo from '@/public/svgs/amv.svg';
import MiningNowLogo from '@/public/svgs/miningnow.svg';
import { H4 } from '../ui/typography';

export function ProductTrustedBy() {
  return (
    <div className="mt-6">
      <H4 className="mb-2 font-medium text-sm">Trusted by</H4>
      <div className="gap-4 grid grid-cols-2 sm:grid-cols-3">
        <div className="flex justify-center items-center p-2 border rounded-md">
          <Image
            src={TrustPilotLogo}
            alt="Trustpilot"
            width={100}
            height={40}
          />
        </div>
        <div className="flex flex-col justify-center items-center p-2 border rounded-md text-center">
          <Image
            src={AmvLogo}
            alt="ASICMinerValue"
            width={100}
            height={24}
            className="mx-auto"
          />
          <p className="mt-1 text-green-600 text-xs">Trusted vendor</p>
        </div>
        <div className="flex flex-col justify-center items-center p-2 border rounded-md text-center">
          <Image
            src={MiningNowLogo}
            alt="Mining Now"
            width={100}
            height={24}
            className="mx-auto"
          />
          <p className="mt-1 text-green-600 text-xs">Trusted vendor</p>
        </div>
      </div>
    </div>
  );
}
