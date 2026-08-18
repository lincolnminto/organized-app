import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  isAccountChooseState,
  isSetupState,
  isUnauthorizedRoleState,
} from '@states/app';
import { accountTypeState } from '@states/settings';
import { setIsAccountChoose } from '@services/states/app';

const useStartup = () => {
  const isUnauthorizedRole = useAtomValue(isUnauthorizedRoleState);
  const isSetup = useAtomValue(isSetupState);
  const accountType = useAtomValue(accountTypeState);
  const isAccountChoose = useAtomValue(isAccountChooseState);
  const hashSearchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const isInvite =
    new URLSearchParams(window.location.search).get('invite') !== null ||
    hashSearchParams.get('invite') !== null;

  const [isAuth, setIsAuth] = useState(true);

  useEffect(() => {
    const checkAccount = async () => {
      if (isInvite) {
        setIsAccountChoose(false);
        setIsAuth(false);
        return;
      }

      if (accountType !== '') {
        setIsAccountChoose(false);
        setIsAuth(false);
        return;
      }

      setIsAccountChoose(true);
      setIsAuth(false);
    };

    const timeout = setTimeout(() => {
      checkAccount();
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [accountType, isInvite]);

  return {
    isUnauthorizedRole,
    isSetup,
    isAuth,
    isAccountChoose,
    accountType: isInvite ? 'vip' : accountType,
  };
};

export default useStartup;
