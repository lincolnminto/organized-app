import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useSetAtom } from 'jotai';
import {
  setAuthPersistence,
  userCreateEmailPassword,
  userSignInEmailPassword,
} from '@services/firebase/auth';
import { apiSendAuthorization } from '@services/api/user';
import { apiAcceptInvite, apiGetInviteInfo, InviteInfo } from '@services/api/invite';
import {
  displayOnboardingFeedback,
  setIsCongAccountCreate,
  setIsEmailLinkAuthenticate,
  setIsUnauthorizedRole,
  setIsUserSignIn,
} from '@services/states/app';
import { useAppTranslation } from '@hooks/index';
import { getMessageByCode } from '@services/i18n/translation';
import { NextStepType } from './index.types';
import { UserLoginResponseType } from '@definition/api';
import {
  isEmailLinkAuthenticateState,
  isUserAccountCreatedState,
} from '@states/app';
import useAuth from '../hooks/useAuth';
import useFeedback from '@features/app_start/shared/hooks/useFeedback';

const useEmailLinkAuth = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useAppTranslation();

  const { hideMessage, message, showMessage, title, variant } = useFeedback();

  const { determineNextStep, updateUserSettings } = useAuth();

  const setIsUserAccountCreated = useSetAtom(isUserAccountCreatedState);
  const setIsEmailAuth = useSetAtom(isEmailLinkAuthenticateState);

  const [isProcessing, setIsProcessing] = useState(false);

  const hashSearchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const inviteToken = searchParams.get('invite') || hashSearchParams.get('invite');
  const [invite, setInvite] = useState<InviteInfo>();
  const loadedInviteToken = useRef<string>();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthorizationError = useCallback(async (message: string) => {
    displayOnboardingFeedback({
      title: getMessageByCode('error_app_generic-title'),
      message: getMessageByCode(message),
    });

    showMessage();
    setIsProcessing(false);
  }, [showMessage]);

  const handleReturn = () => {
    setIsEmailLinkAuthenticate(false);
    setIsUserSignIn(true);
    setSearchParams('');
  };

  const handleUnauthorizedUser = () => {
    setIsEmailAuth(true);
    setIsUserAccountCreated(false);
    setIsUnauthorizedRole(true);
  };

  const completeInviteAcceptance = async () => {
    if (!inviteToken || !invite || password.length < 8 || !firstname || !lastname) return;

    try {
      if (isProcessing) return;

      hideMessage();
      setIsProcessing(true);
      await setAuthPersistence();
      try {
        await userCreateEmailPassword(invite.email, password);
      } catch (error) {
        if ((error as { code?: string }).code !== 'auth/email-already-in-use') {
          throw error;
        }

        await userSignInEmailPassword(invite.email, password);
      }
      await apiAcceptInvite({ token: inviteToken, firstname, lastname });
      const { status, data } = await apiSendAuthorization();

      if (status !== 200) {
        handleAuthorizationError(data.message);
        return;
      }

      const nextStep: NextStepType = determineNextStep(data as UserLoginResponseType);

      if (nextStep.isVerifyMFA || nextStep.encryption || nextStep.createCongregation) {
        await updateUserSettings(data as UserLoginResponseType, nextStep);
      }

      if (nextStep.unauthorized) {
        handleUnauthorizedUser();
      }

      setSearchParams('');
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      await handleAuthorizationError(err.code || err.message || t('error_app_generic-desc'));
    }
  };

  useEffect(() => {
    setIsUserSignIn(false);
    setIsCongAccountCreate(false);
  }, []);

  useEffect(() => {
    if (!inviteToken || loadedInviteToken.current === inviteToken) return;

    loadedInviteToken.current = inviteToken;

    void apiGetInviteInfo(inviteToken)
      .then(setInvite)
      .catch((error) => handleAuthorizationError(error.message));
  }, [inviteToken, handleAuthorizationError]);

  return {
    completeEmailAuth: completeInviteAcceptance,
    completeInviteAcceptance,
    invite,
    firstname,
    setFirstname,
    lastname,
    setLastname,
    password,
    setPassword,
    isProcessing,
    handleReturn,
    title,
    message,
    variant,
    hideMessage,
  };
};

export default useEmailLinkAuth;
