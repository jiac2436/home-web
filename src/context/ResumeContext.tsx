/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { TRANSLATIONS } from '../data/translations';

export interface ResumeDataLocale {
  information: {
    name: string;
    role: string;
    location: string;
    phone?: string;
    email?: string;
    education?: string;
    point1Title: string;
    point1Desc: string;
    point2Title: string;
    point2Desc: string;
    point3Title: string;
    point3Desc: string;
  };
  experience: {
    title: string;
    subtitle: string;
    exp1Role: string;
    exp1Desc: string;
    exp1Time: string;
    exp2Role: string;
    exp2Desc: string;
    exp2Time: string;
    exp3Role: string;
    exp3Desc: string;
    exp3Time: string;
    [key: string]: unknown;
  };
  works: {
    title: string;
    subtitle: string;
    w1Tag: string;
    w1Title: string;
    w1Desc: string;
    w2Tag: string;
    w2Title: string;
    w2Desc: string;
    w3Tag: string;
    w3Title: string;
    w3Desc: string;
    w4Tag: string;
    w4Title: string;
    w4Desc: string;
    [key: string]: unknown;
  };
  contact: {
    title: string;
    subtitle: string;
    channel: string;
    desc: string;
    copyBtn?: string;
    alertCopied?: string;
    email?: string;
    phone?: string;
    [key: string]: unknown;
  };
}

export interface ResumeProfile {
  profile_key: string;
  zh: ResumeDataLocale;
  en: ResumeDataLocale;
}

interface ResumeContextType {
  profile: ResumeProfile | null;
  loading: boolean;
  error: string | null;
  currentCards: typeof TRANSLATIONS.zh.cards;
  refreshResume: () => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, t } = useLanguage();
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  useEffect(() => {
    let ignore = false;
    const apiHost = window.location.port === '5173' ? 'http://127.0.0.1:8000' : '';
    
    fetch(`${apiHost}/api/v1/resume/profile`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json() as Promise<ResumeProfile>;
      })
      .then((data) => {
        if (!ignore) {
          setProfile(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Failed to fetch resume';
          console.warn('Failed to load resume profile from backend, falling back to local translations:', message);
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  const refreshResume = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  // 组装当前语言下的卡片数据：优先使用后端返回的数据，缺失或请求中则优雅降级为本地 translations.ts
  const currentCards = React.useMemo(() => {
    const fallbackCards = t.cards;
    if (!profile) return fallbackCards;

    const remoteLocaleData = lang === 'en' ? profile.en : profile.zh;
    if (!remoteLocaleData) return fallbackCards;

    return {
      information: {
        ...fallbackCards.information,
        ...remoteLocaleData.information,
      },
      experience: {
        ...fallbackCards.experience,
        ...remoteLocaleData.experience,
      },
      works: {
        ...fallbackCards.works,
        ...remoteLocaleData.works,
      },
      contact: {
        ...fallbackCards.contact,
        ...remoteLocaleData.contact,
      },
    };
  }, [profile, lang, t]);

  return (
    <ResumeContext.Provider
      value={{
        profile,
        loading,
        error,
        currentCards,
        refreshResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return ctx;
};
