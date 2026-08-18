import { useState } from 'react';
import { useSetAtom } from 'jotai';
import {
  isEmailSentState,
  isUserSignInState,
} from '@states/app';
import useFeedback from '@features/app_start/shared/hooks/useFeedback';

const useEmailSent = () => {
  const { hideMessage, message, title, variant } = useFeedback();

  const setIsEmailSent = useSetAtom(isEmailSentState);
  const setIsUserSignIn = useSetAtom(isUserSignInState);

  const [code, setCode] = useState('');

  const handleReturnChooser = () => {
    setIsEmailSent(false);
    setIsUserSignIn(true);
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  return {
    hideMessage,
    message,
    title,
    variant,
    handleLinkClick: () => undefined,
    devLink: '',
    handleCodeChange,
    code,
    hasError: false,
    devOTP: '',
    handleReturnChooser,
  };
};

export default useEmailSent;
