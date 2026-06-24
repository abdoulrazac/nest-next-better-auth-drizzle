import type { CaptchaRenderProps } from "@better-auth-ui/react/plugins";
import { useCallback, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export function CaptchaWidget({
  setToken,
  clearToken,
  setReset,
}: CaptchaRenderProps): React.JSX.Element | null {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleVerify = useCallback(async () => {
    if (!executeRecaptcha) return;
    try {
      const token = await executeRecaptcha();
      setToken(token);
    } catch {
      clearToken();
    }
  }, [executeRecaptcha, setToken, clearToken]);

  useEffect(() => {
    handleVerify();
  }, [handleVerify]);

  useEffect(() => {
    setReset(() => handleVerify());
    return () => setReset(null);
  }, [setReset, handleVerify]);

  return null;
}
