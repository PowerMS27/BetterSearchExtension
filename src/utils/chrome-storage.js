export const getDomain = () => {
  try {
    return new URL(window.location.href).hostname;
  } catch (e) {
    console.warn("Could not extract domain:", e);
    return null;
  }
};

export const getSiteSetting = async (key) => {
  const domain = getDomain();
  if (!domain) return null;

  return new Promise((resolve) => {
    chrome.storage.local.get([domain], (result) => {
      resolve(result[domain]?.[key] ?? null);
    });
  });
};

export const setSiteSetting = async (key, value) => {
  const domain = getDomain();
  if (!domain) return;

  return new Promise((resolve) => {
    chrome.storage.local.get([domain], (result) => {
      const siteSettings = result[domain] || {};
      siteSettings[key] = value;

      chrome.storage.local.set({ [domain]: siteSettings }, resolve);
    });
  });
};
