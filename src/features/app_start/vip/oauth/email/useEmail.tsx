import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { displayOnboardingFeedback } from '@services/states/app';
import { useAppTranslation } from '@hooks/index';
import { isEmailValid } from '@services/validator/index';
import { apiAdminEmailPasswordSignin } from '@services/api/user';
import {
  isUnauthorizedRoleState,
  isUserSignInState,
  isUserAccountCreatedState,
  isUserMfaVerifyState,
} from '@states/app';
import { getMessageByCode } from '@services/i18n/translation';
import useFeedback from '@features/app_start/shared/hooks/useFeedback';
import { setAuthPersistence, userSignInEmailPassword } from '@services/firebase/auth';
import { UserLoginResponseType } from '@definition/api';
import useAuth from '../../hooks/useAuth';

const useOAuthEmail = () => {
  const { t } = useAppTranslation();

  const { hideMessage, showMessage } = useFeedback();

  const setIsUserSignIn = useSetAtom(isUserSignInState);
  const setUserMfaVerify = useSetAtom(isUserMfaVerifyState);
  const setIsUserAccountCreated = useSetAtom(isUserAccountCreatedState);
  const setIsUnauthorizedRole = useSetAtom(isUnauthorizedRoleState);

  const { determineNextStep, updateUserSettings } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [userTmpEmail, setUserTmpEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthorizationError = (message: string) => {
    displayOnboardingFeedback({
      title: t('error_app_generic-title'),
      message: getMessageByCode(message),
    });
    showMessage();
    setIsProcessing(false);
  };

  const handleUnauthorizedUser = () => {
    setUserMfaVerify(true);
    setIsUserAccountCreated(false);
    setIsUnauthorizedRole(true);
  };

  const handleSignin = async () => {
    if (isProcessing) return;

    hideMessage();

    if (!isEmailValid(userTmpEmail)) {
      displayOnboardingFeedback({
        title: t('error_app_generic-title'),
        message: t('tr_emailNotSupported'),
      });
      showMessage();

      return;
    }

    try {
      setIsProcessing(true);
      await setAuthPersistence();
      await userSignInEmailPassword(userTmpEmail, password);

      const { status, data } = await apiAdminEmailPasswordSignin();

      if (status !== 200) {
        handleAuthorizationError(data.message);
        return;
      }

      const nextStep = determineNextStep(data as UserLoginResponseType);

      if (nextStep.isVerifyMFA || nextStep.encryption || nextStep.createCongregation) {
        await updateUserSettings(data as UserLoginResponseType, nextStep);
      }

      if (nextStep.unauthorized) {
        handleUnauthorizedUser();
      }

      setIsProcessing(false);
      setIsUserSignIn(false);
    } catch (error) {
      console.error(error);
      handleAuthorizationError(
        (error as { code?: string; message?: string }).code ||
          (error as Error).message ||
          t('error_app_generic-desc')
      );
    }
  };

  return {
    isProcessing,
    setUserTmpEmail,
    setPassword,
    handleSignin,
    userTmpEmail,
    password,
  };
};

export default useOAuthEmail;
